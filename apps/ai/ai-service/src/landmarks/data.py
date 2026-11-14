"""Audit originals without mutation, cluster near duplicates, and freeze a split manifest."""
import argparse
import csv
import hashlib
import random
import re
from collections import Counter, defaultdict
from pathlib import Path

import imagehash
from PIL import Image, ImageDraw, ImageOps

from src.common import ROOT, config, digest, open_rgb, write_json

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
FIELDS = ["image_id", "relative_path", "class_key", "source_id", "group_id", "exact_hash",
          "phash", "width", "height", "split", "excluded_reason", "source_partition"]


def load_rows(path=ROOT / "manifests" / "manifest.csv"):
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def assign_splits(rows, cfg):
    rng = random.Random(cfg["seed"])
    filename_split = cfg.get("split_strategy") == "filename_train_test"
    if filename_split:
        partitions = defaultdict(set)
        for row in rows:
            match = re.fullmatch(rf"{re.escape(row['class_key'])}_(train|test)_\d+",
                                 Path(row["relative_path"]).stem)
            if not match:
                raise ValueError(f"Missing train/test filename partition: {row['relative_path']}")
            row["source_partition"] = match[1]
            partitions[row["group_id"]].add(match[1])
        if any(len(value) != 1 for value in partitions.values()):
            raise ValueError("Duplicate group crosses filename train/test partitions")
        val_fraction = cfg.get("validation_fraction_of_train", 0.125)
        cal_fraction = cfg.get("calibration_fraction_of_train", 0.125)
        if not (0 < val_fraction < 1 and 0 < cal_fraction < 1 and val_fraction + cal_fraction < 1):
            raise ValueError("Invalid validation/calibration fractions")
    for label in sorted(cfg["classes"]):
        selected = [row for row in rows if row["class_key"] == label and not row["excluded_reason"]]
        label_groups = sorted({row["group_id"] for row in selected})
        if len(label_groups) < 8:
            raise ValueError(f"{label} has only {len(label_groups)} independent groups; collect more data.")
        rng.shuffle(label_groups)
        allocation = {}
        if filename_split:
            training = [row for row in selected if row["source_partition"] == "train"]
            weights = Counter(row["group_id"] for row in training)
            remaining = [group for group in label_groups if group in weights]
            allocation.update({row["group_id"]: "test" for row in selected if row["source_partition"] == "test"})
            for split, fraction in (("val", val_fraction), ("calibration", cal_fraction)):
                # Subset sums keep whole duplicate/source groups nearest to the image budget.
                choices = {0: ()}
                for group in remaining:
                    for count, groups in list(choices.items()):
                        choices.setdefault(count + weights[group], (*groups, group))
                target = max(1, round(len(training) * fraction))
                candidates = [count for count, groups in choices.items()
                              if count and len(groups) < len(remaining) - (1 if split == "val" else 0)]
                if not candidates:
                    raise ValueError(f"Not enough train groups for {label}/{split}")
                chosen = choices[min(candidates, key=lambda count: (abs(count - target), count))]
                allocation.update({group: split for group in chosen})
                remaining = [group for group in remaining if group not in chosen]
        else:
            n = max(1, round(len(label_groups) * 0.1))
            for start, split in [(0, "test"), (n, "calibration"), (2*n, "val")]:
                allocation.update({group: split for group in label_groups[start:start+n]})
        for row in rows:
            if row["class_key"] == label:
                row["split"] = allocation.get(row["group_id"], "train")
                row.setdefault("source_partition", "")


def prepare(cfg, overwrite=False):
    root = Path(cfg["dataset_root"])
    out = ROOT / "manifests"
    manifest = out / "manifest.csv"
    if manifest.exists() and not overwrite:
        raise RuntimeError("Manifest already exists. Use --overwrite only for a new data version; old metrics become stale.")
    out.mkdir(parents=True, exist_ok=True)
    report_dir = ROOT / "reports" / "data"
    report_dir.mkdir(parents=True, exist_ok=True)
    unknown = sorted(p.name for p in root.iterdir() if p.is_dir()
                     and p.name not in cfg["classes"] and p.name not in cfg["excluded_directories"])
    if unknown:
        raise ValueError(f"Unexpected dataset directories: {unknown}. Update the whitelist explicitly.")
    manual = {}
    manual_path = out / "manual_groups.csv"
    if manual_path.exists():
        with manual_path.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                if row.get("source_id"):
                    manual[row["relative_path"]] = row["source_id"]
    rows, issues = [], []
    for label in sorted(cfg["classes"]):
        folder = root / label
        if not folder.is_dir():
            raise ValueError(f"Missing class folder: {folder}")
        for path in sorted(folder.rglob("*")):
            if not path.is_file():
                continue
            rel = path.relative_to(root).as_posix()
            if path.suffix.lower() not in EXTENSIONS:
                issues.append({"path": rel, "reason": "unsupported_extension"})
                continue
            try:
                with Image.open(path) as original:
                    if getattr(original, "n_frames", 1) != 1:
                        raise ValueError("animated image")
                image = open_rgb(path)
                width, height = image.size
                if min(width, height) < 64:
                    raise ValueError("short edge below 64 pixels")
                rows.append(dict(image_id=hashlib.sha256(rel.encode()).hexdigest()[:16], relative_path=rel,
                                 class_key=label, source_id=manual.get(rel, ""), group_id="", exact_hash=digest(path),
                                 phash=str(imagehash.phash(image)), width=width, height=height,
                                 split="", excluded_reason=""))
            except Exception as e:
                issues.append({"path": rel, "reason": f"{type(e).__name__}: {e}"})
    parent = list(range(len(rows)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i, j):
        parent[find(j)] = find(i)

    near_pairs = []
    hashes = [int(r["phash"], 16) for r in rows]
    for i in range(len(rows)):
        for j in range(i):
            distance = (hashes[i] ^ hashes[j]).bit_count()
            same_source = rows[i]["source_id"] and rows[i]["source_id"] == rows[j]["source_id"]
            if rows[i]["exact_hash"] == rows[j]["exact_hash"] or distance <= cfg["phash_distance"] or same_source:
                union(i, j)
                near_pairs.append({"a": rows[j]["relative_path"], "b": rows[i]["relative_path"], "phash_distance": distance})
    groups = defaultdict(list)
    for i in range(len(rows)):
        groups[find(i)].append(i)
    exact_seen = set()
    for indices in groups.values():
        gid = min(rows[i]["image_id"] for i in indices)
        conflict = len({rows[i]["class_key"] for i in indices}) > 1
        for i in indices:
            row = rows[i]
            row["group_id"] = gid
            if conflict:
                row["excluded_reason"] = "cross_class_duplicate_group_review_required"
            elif row["exact_hash"] in exact_seen:
                row["excluded_reason"] = "exact_duplicate"
            exact_seen.add(row["exact_hash"])
    assign_splits(rows, cfg)
    validate_manifest(rows, sorted(cfg["classes"]))
    with manifest.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    write_json(out / "classes.json", [{"index": i, "class_key": k, "display_name": cfg["classes"][k]}
                                      for i, k in enumerate(sorted(cfg["classes"]))])
    counts = {label: dict(Counter(r["split"] for r in rows if r["class_key"] == label and not r["excluded_reason"]))
              for label in sorted(cfg["classes"])}
    report = {"valid_decoded": len(rows), "used": sum(not r["excluded_reason"] for r in rows), "issues": issues,
              "excluded": [r for r in rows if r["excluded_reason"]], "split_counts": counts,
              "groups": len(groups), "near_pairs": near_pairs, "manifest_sha256": digest(manifest),
              "seed": cfg["seed"], "phash_distance": cfg["phash_distance"],
              "split_strategy": cfg.get("split_strategy", "group_random_70_10_10_10"),
              "source_partition_counts": dict(Counter(r["source_partition"] for r in rows)),
              "limitations": "No source metadata supplied unless manual_groups.csv exists. pHash cannot rule out all source leakage. Review contact sheets."}
    write_json(report_dir / "dataset_report.json", report)
    # Numbered sheets allow human review without changing originals.
    for label in sorted(cfg["classes"]):
        selected = [r for r in rows if r["class_key"] == label]
        for page, start in enumerate(range(0, len(selected), 30)):
            subset = selected[start:start+30]
            sheet = Image.new("RGB", (900, ((len(subset)+4)//5)*145), "white")
            draw = ImageDraw.Draw(sheet)
            for idx, row in enumerate(subset):
                x, y = (idx % 5)*180, (idx//5)*145
                thumb = ImageOps.contain(open_rgb(root / row["relative_path"]), (176, 115))
                sheet.paste(thumb, (x, y))
                draw.text((x+2, y+116), f"{start+idx}: {row['split'] or 'excluded'} / {row['group_id'][:5]}", fill="black")
            sheet.save(report_dir / f"{label}-{page+1}.jpg")
    print({"used": report["used"], "issues": len(issues), "counts": counts}, flush=True)
    return report


def validate_manifest(rows, labels):
    split_groups, hashes = defaultdict(set), defaultdict(set)
    for row in rows:
        if row["excluded_reason"]:
            continue
        split_groups[row["group_id"]].add(row["split"])
        hashes[row["exact_hash"]].add(row["split"])
    if any(len(s) != 1 for s in [*split_groups.values(), *hashes.values()]):
        raise ValueError("Group/hash leakage between splits")
    for label in labels:
        for split in ("train", "val", "calibration", "test"):
            if not any(r["class_key"] == label and r["split"] == split and not r["excluded_reason"] for r in rows):
                raise ValueError(f"Empty split {label}/{split}")


def verify_sources(rows, root):
    root = Path(root)
    for row in rows:
        if not row["excluded_reason"] and digest(root / row["relative_path"]) != row["exact_hash"]:
            raise ValueError(f"Source changed since audit: {row['relative_path']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--config", type=Path)
    args = parser.parse_args()
    prepare(config(args.config) if args.config else config(), args.overwrite)
