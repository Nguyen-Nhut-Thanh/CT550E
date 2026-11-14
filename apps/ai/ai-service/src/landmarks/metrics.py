"""Recompute classification metrics and export Excel-readable CSVs from saved test predictions."""
import argparse
import csv
import math
from collections import Counter
from pathlib import Path

from src.common import ROOT, config, digest, read_json, write_json
from src.landmarks.data import load_rows

PREDICTION_FIELDS = ["image_id", "relative_path", "group_id", "actual_label", "predicted_label",
                     "actual_name", "predicted_name", "confidence", "confidence_percent", "correct"]
HISTORY_FIELDS = ["epoch", "stage", "train_loss", "train_accuracy", "val_loss", "val_accuracy",
                  "val_macro_f1", "seconds"]


def ratio(numerator, denominator):
    return numerator / denominator if denominator else 0.0


def write_csv(path, fields, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fields)
        writer.writeheader()
        writer.writerows(rows)


def calculate_tables(classes, predictions, manifest, saved_metrics, model_version):
    keys = [item["class_key"] for item in classes]
    if not keys or len(set(keys)) != len(keys):
        raise ValueError("Missing or duplicate class keys")
    names = {item["class_key"]: item["display_name"] for item in classes}
    expected = {row["relative_path"]: row for row in manifest
                if row["split"] == "test" and not row["excluded_reason"]}
    paths = [row["relative_path"] for row in predictions]
    if not paths or len(set(paths)) != len(paths) or set(paths) != set(expected):
        raise ValueError("Predictions must match every usable test image exactly once")
    matrix = {actual: Counter() for actual in keys}
    normalized = []
    for row in predictions:
        source = expected[row["relative_path"]]
        actual = row.get("actual_label", row.get("true_label"))
        predicted = row["predicted_label"]
        if actual not in names or predicted not in names or actual != source["class_key"]:
            raise ValueError(f"Unknown/mismatched label: {row['relative_path']}")
        if row.get("group_id") != source["group_id"]:
            raise ValueError(f"Mismatched test group: {row['relative_path']}")
        confidence = float(row["confidence"])
        if not math.isfinite(confidence) or not 0 <= confidence <= 1:
            raise ValueError("Confidence must be finite and between 0 and 1")
        matrix[actual][predicted] += 1
        normalized.append(dict(image_id=source.get("image_id", ""), relative_path=row["relative_path"],
                               group_id=source["group_id"], actual_label=actual, predicted_label=predicted,
                               actual_name=names[actual], predicted_name=names[predicted], confidence=confidence,
                               confidence_percent=confidence * 100, correct=int(actual == predicted)))
    total = len(normalized)
    per_class = []
    for index, key in enumerate(keys):
        tp = matrix[key][key]
        support = sum(matrix[key].values())
        predicted_count = sum(matrix[actual][key] for actual in keys)
        fn, fp = support - tp, predicted_count - tp
        tn = total - tp - fn - fp
        per_class.append(dict(class_index=index, class_key=key, display_name=names[key],
                              tp=tp, fp=fp, fn=fn, tn=tn, precision=ratio(tp, tp+fp), recall=ratio(tp, tp+fn),
                              f1_score=ratio(2*tp, 2*tp+fp+fn), specificity=ratio(tn, tn+fp),
                              support=support, predicted_count=predicted_count,
                              one_vs_rest_accuracy=ratio(tp+tn, total)))
    correct = sum(row["tp"] for row in per_class)
    summary = dict(model_version=model_version, split="test", n_classes=len(keys), n_images=total,
                   n_correct=correct, n_incorrect=total-correct, accuracy=correct/total,
                   accuracy_percent=100*correct/total)
    for metric in ("precision", "recall", "f1_score"):
        column = "f1" if metric == "f1_score" else metric
        summary[f"macro_{column}"] = sum(row[metric] for row in per_class)/len(keys)
        summary[f"weighted_{column}"] = sum(row[metric]*row["support"] for row in per_class)/total
        summary[f"micro_{column}"] = correct/total
    summary["top3_accuracy"] = saved_metrics.get("top3_accuracy", "")
    for key in ("accuracy", "macro_f1"):
        if key in saved_metrics and not math.isclose(summary[key], saved_metrics[key], abs_tol=1e-12):
            raise ValueError(f"Recomputed {key} disagrees with saved metrics")
    if saved_metrics.get("n_test", total) != total:
        raise ValueError("Saved test sample count disagrees with predictions")
    if saved_metrics.get("n_classes", len(keys)) != len(keys):
        raise ValueError("Saved class count disagrees with classes.json")
    confusion = [dict(actual_label=actual, **{key: matrix[actual][key] for key in keys}) for actual in keys]
    counts = []
    for key in keys:
        selected = [row for row in manifest if row["class_key"] == key]
        used = Counter(row["split"] for row in selected if not row["excluded_reason"])
        counts.append(dict(class_key=key, display_name=names[key], total_images=len(selected),
                           used_images=sum(used.values()), excluded_images=sum(bool(row["excluded_reason"]) for row in selected),
                           **{split: used[split] for split in ("train", "val", "calibration", "test")}))
    return {
        "summary_metrics.csv": (list(summary), [summary]),
        "per_class_metrics.csv": (list(per_class[0]), per_class),
        "test_predictions.csv": (PREDICTION_FIELDS, normalized),
        "test_errors.csv": (PREDICTION_FIELDS, [row for row in normalized if not row["correct"]]),
        "confusion_matrix.csv": (["actual_label", *keys], confusion),
        "split_counts.csv": (list(counts[0]), counts),
    }


def export_training_history(bundle, report_dir=None):
    bundle = Path(bundle)
    report_dir = Path(report_dir or ROOT / "reports" / bundle.name)
    history = read_json(bundle / "history.json")
    write_csv(report_dir / "training_history.csv", HISTORY_FIELDS,
              [{key: row.get(key, "") for key in HISTORY_FIELDS} for row in history])


def export_csv(bundle, report_dir=None):
    bundle = Path(bundle)
    report_dir = Path(report_dir or ROOT / "reports" / bundle.name)
    manifest = bundle / "manifest.csv"
    if digest(manifest) != (bundle / "manifest_hash.txt").read_text().strip():
        raise ValueError("Manifest checksum mismatch")
    classes = read_json(bundle / "classes.json")
    metrics = read_json(bundle / "metrics.json")
    with (report_dir / "test_predictions.csv").open(encoding="utf-8-sig", newline="") as stream:
        predictions = list(csv.DictReader(stream))
    version = read_json(bundle / "training_config.json")["model_version"]
    tables = calculate_tables(classes, predictions, load_rows(manifest), metrics, version)
    for filename, (fields, rows) in tables.items():
        write_csv(report_dir / filename, fields, rows)
    export_training_history(bundle, report_dir)
    write_json(report_dir / "csv_exports.json", dict(model_version=version, encoding="UTF-8 with BOM",
               score_units="Fractions 0..1; *_percent columns use 0..100; counts are integers.",
               source_manifest_sha256=digest(manifest), source_metrics_sha256=digest(bundle / "metrics.json"),
               predictions_sha256=digest(report_dir / "test_predictions.csv"),
               top3_source="Previously measured top3_accuracy from model metrics.json; not reconstructed from top-1 predictions.",
               csv_files=[*tables, "training_history.csv"]))
    print(f"Exported {len(tables)+1} CSV files to {report_dir}", flush=True)
    return tables


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-version")
    args = parser.parse_args()
    version = args.model_version or config()["model_version"]
    if Path(version).name != version or version in (".", ".."):
        raise ValueError("model-version must be a directory name")
    export_csv(ROOT / "models" / version)
