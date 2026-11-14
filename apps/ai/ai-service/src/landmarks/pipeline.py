"""Reproducible closed-set baseline: train -> calibrate -> gallery -> held-out evaluation."""
import argparse
import csv
import json
import math
import os
import platform
import time
from pathlib import Path
from src.common import ROOT

os.environ.setdefault("MPLCONFIGDIR", str(ROOT.parent / ".cache" / "matplotlib"))
os.environ.setdefault("TORCH_HOME", str(ROOT.parent / ".cache" / "torch"))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn.functional as F
import torchvision
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay, f1_score
from torch.utils.data import DataLoader

from src.common import config, digest, open_rgb, read_json, seed_all, write_json
from src.landmarks.data import load_rows, validate_manifest, verify_sources
from src.landmarks.model import ManifestDataset, PREPROCESSING, build_model, features, device_for
from src.landmarks.metrics import export_csv, export_training_history


def loader(rows, cfg, classes, split, training=False):
    ds = ManifestDataset(rows, cfg["dataset_root"], classes, split, training)
    return DataLoader(ds, batch_size=cfg["batch_size"], shuffle=training, num_workers=cfg["workers"])


@torch.inference_mode()
def collect(model, batches, device):
    model.eval()
    logits, targets, embeddings = [], [], []
    for x, y in batches:
        z = features(model, x.to(device))
        logits.append(model.fc(z).cpu())
        targets.append(y)
        embeddings.append(F.normalize(z, dim=1).cpu())
    return torch.cat(logits), torch.cat(targets), torch.cat(embeddings)


def probability_metrics(logits, targets, temperature=1.0, bins=5):
    p = torch.softmax(logits / temperature, dim=1)
    conf, pred = p.max(1)
    correct = pred.eq(targets).float()
    ece = 0.0
    reliability = []
    for idx in range(bins):
        selected = (conf > idx/bins) & (conf <= (idx+1)/bins)
        count = int(selected.sum())
        acc = float(correct[selected].mean()) if count else None
        avg = float(conf[selected].mean()) if count else None
        if count:
            ece += count / len(targets) * abs(acc-avg)
        reliability.append({"lower": idx/bins, "upper": (idx+1)/bins, "count": count, "accuracy": acc, "confidence": avg})
    brier = ((p - F.one_hot(targets, p.shape[1]).float())**2).sum(1).mean()
    return {"nll": float(F.cross_entropy(logits / temperature, targets)), "brier": float(brier),
            "ece": ece, "bins": bins, "n": len(targets), "reliability": reliability}


def calibrate(logits, targets):
    # One parameter; bound to limit extreme fits on the small calibration split.
    log_t = torch.zeros(1, requires_grad=True)
    optimizer = torch.optim.Adam([log_t], lr=0.03)
    before = float(F.cross_entropy(logits, targets))
    best_loss, best_t = before, 1.0
    for _ in range(150):
        optimizer.zero_grad()
        t = log_t.exp()
        loss = F.cross_entropy(logits / t, targets)
        loss.backward()
        optimizer.step()
        with torch.no_grad():
            log_t.clamp_(math.log(0.5), math.log(10))
            new_loss = float(F.cross_entropy(logits / log_t.exp(), targets))
            if new_loss < best_loss:
                best_loss, best_t = new_loss, float(log_t.exp().item())
    return best_t


def train(cfg, device, fine_tune_epochs=0):
    seed_all(cfg["seed"])
    torch.set_num_threads(cfg["torch_threads"])
    manifest = ROOT / "manifests" / "manifest.csv"
    rows = load_rows(manifest)
    classes = read_json(ROOT / "manifests" / "classes.json")
    validate_manifest(rows, [c["class_key"] for c in classes])
    verify_sources(rows, cfg["dataset_root"])
    bundle = ROOT / "models" / cfg["model_version"]
    if (bundle / "best_model.pth").exists():
        raise RuntimeError("Model version already exists. Set a new model_version in config; do not overwrite evaluated models.")
    bundle.mkdir(parents=True, exist_ok=True)
    write_json(bundle / "classes.json", classes)
    write_json(bundle / "preprocessing.json", PREPROCESSING)
    write_json(bundle / "training_config.json", {**cfg, "fine_tune_epochs": fine_tune_epochs,
               "device": str(device), "torch": torch.__version__, "torchvision": torchvision.__version__,
               "python": platform.python_version(), "manifest_sha256": digest(manifest),
               "gpu": torch.cuda.get_device_name(0) if device.type == "cuda" else None})
    (bundle / "manifest_hash.txt").write_text(digest(manifest), encoding="utf-8")
    # Snapshot manifest/classes to make the model's split auditable later.
    (bundle / "manifest.csv").write_bytes(manifest.read_bytes())
    model = build_model(len(classes), pretrained=True).to(device)
    for param in model.parameters():
        param.requires_grad = False
    for param in model.fc.parameters():
        param.requires_grad = True
    train_batches = loader(rows, cfg, classes, "train", training=True)
    val_batches = loader(rows, cfg, classes, "val")
    history, best_key, best_epoch = [], (-1.0, -math.inf), None
    start = time.perf_counter()
    stages = [("head", cfg["epochs"])]
    if fine_tune_epochs:
        stages.append(("layer4", fine_tune_epochs))
    for stage, epochs in stages:
        if stage == "layer4":
            model.load_state_dict(torch.load(bundle / "best_model.pth", map_location=device, weights_only=True))
            for p in model.layer4.parameters():
                p.requires_grad = True
            optimizer = torch.optim.AdamW([
                {"params": model.layer4.parameters(), "lr": 1e-5},
                {"params": model.fc.parameters(), "lr": 1e-4}], weight_decay=cfg["weight_decay"])
        else:
            optimizer = torch.optim.AdamW(model.fc.parameters(), lr=cfg["learning_rate"], weight_decay=cfg["weight_decay"])
        stale = 0
        for epoch in range(epochs):
            tick = time.perf_counter()
            # Frozen backbone and all BN statistics remain stable even in fine-tuning.
            model.eval()
            model.fc.train()
            loss_sum, count, correct = 0.0, 0, 0
            for x, y in train_batches:
                x, y = x.to(device), y.to(device)
                optimizer.zero_grad(set_to_none=True)
                if stage == "head":
                    with torch.no_grad():
                        z = features(model, x)
                    logits = model.fc(z)
                else:
                    logits = model(x)
                loss = F.cross_entropy(logits, y)
                loss.backward()
                optimizer.step()
                loss_sum += float(loss.detach()) * len(y)
                count += len(y)
                correct += int(logits.argmax(1).eq(y).sum())
            val_logits, val_y, _ = collect(model, val_batches, device)
            val_loss = float(F.cross_entropy(val_logits, val_y))
            val_pred = val_logits.argmax(1).numpy()
            val_f1 = f1_score(val_y.numpy(), val_pred, labels=list(range(len(classes))), average="macro", zero_division=0)
            row = {"epoch": len(history)+1, "stage": stage, "train_loss": loss_sum/count,
                   "train_accuracy": correct/count, "val_loss": val_loss,
                   "val_accuracy": float((val_pred == val_y.numpy()).mean()), "val_macro_f1": float(val_f1),
                   "seconds": time.perf_counter()-tick}
            history.append(row)
            key = (float(val_f1), -val_loss)
            if key > best_key:
                best_key, best_epoch, stale = key, row["epoch"], 0
                torch.save({k: v.detach().cpu() for k, v in model.state_dict().items()}, bundle / "best_model.pth")
            else:
                stale += 1
            write_json(bundle / "history.json", history)
            print(json.dumps(row), flush=True)
            if stale >= cfg["patience"]:
                break
    model.load_state_dict(torch.load(bundle / "best_model.pth", map_location=device, weights_only=True))
    cal_logits, cal_y, _ = collect(model, loader(rows, cfg, classes, "calibration"), device)
    temperature = calibrate(cal_logits.clone(), cal_y.clone())
    write_json(bundle / "calibration.json", {"method": "temperature_scaling", "temperature": temperature,
               "calibrated": True, "n": len(cal_y), "split": "calibration", "bounds": [0.5, 10],
               "before": probability_metrics(cal_logits, cal_y), "after": probability_metrics(cal_logits, cal_y, temperature),
               "limitation": f"Small calibration set; confidence is conditional on the {len(classes)} supported classes, not an OOD guarantee."})
    write_json(bundle / "thresholds.json", {"enabled": False, "ood_validated": False,
               "reason": "No independently labelled OOD development/test set. Demo performs forced-choice classification only."})
    _, gallery_y, gallery_z = collect(model, loader(rows, cfg, classes, "train"), device)
    np.savez_compressed(bundle / "gallery_embeddings.npz", embeddings=gallery_z.numpy(), labels=gallery_y.numpy())
    write_json(bundle / "gallery_metadata.json", [r for r in rows if r["split"] == "train" and not r["excluded_reason"]])
    write_json(bundle / "training_summary.json", {"best_epoch": best_epoch, "best_val_macro_f1": best_key[0],
               "train_seconds": time.perf_counter()-start, "embedding_dim": 2048,
               "checkpoint_sha256": digest(bundle / "best_model.pth")})
    print(f"Training finished: {bundle}", flush=True)
    export_training_history(bundle)
    return bundle


def evaluate(bundle, cfg, device):
    torch.set_num_threads(cfg["torch_threads"])
    bundle = Path(bundle)
    # Evaluation always uses the immutable manifest stored with the checkpoint.
    classes = read_json(bundle / "classes.json")
    rows = load_rows(bundle / "manifest.csv")
    if digest(bundle / "manifest.csv") != (bundle / "manifest_hash.txt").read_text().strip():
        raise ValueError("Manifest hash mismatch")
    validate_manifest(rows, [c["class_key"] for c in classes])
    verify_sources(rows, cfg["dataset_root"])
    model = build_model(len(classes)).to(device)
    model.load_state_dict(torch.load(bundle / "best_model.pth", map_location=device, weights_only=True))
    batches = loader(rows, cfg, classes, "test")
    logits, targets, _ = collect(model, batches, device)
    temperature = read_json(bundle / "calibration.json")["temperature"]
    p = torch.softmax(logits / temperature, dim=1).numpy()
    y, pred = targets.numpy(), p.argmax(1)
    names = [c["class_key"] for c in classes]
    labels = list(range(len(classes)))
    report = classification_report(y, pred, labels=labels, target_names=names, output_dict=True, zero_division=0)
    test_rows = batches.dataset.rows
    # Resample entire image groups rather than treating near duplicates as independent.
    groups = sorted({r["group_id"] for r in test_rows})
    rng = np.random.default_rng(cfg["seed"])
    group_results = {g: (pred == y)[[i for i, r in enumerate(test_rows) if r["group_id"] == g]] for g in groups}
    boot = [float(np.concatenate([group_results[g] for g in rng.choice(groups, len(groups), replace=True)]).mean()) for _ in range(1000)]
    timings = []
    x, _ = batches.dataset[0]
    with torch.inference_mode():
        x = x[None].to(device)
        for idx in range(23):
            if device.type == "cuda":
                torch.cuda.synchronize()
            tick = time.perf_counter()
            model(x)
            if device.type == "cuda":
                torch.cuda.synchronize()
            if idx >= 3:
                timings.append((time.perf_counter()-tick)*1000)
    metrics = {"scope": f"closed_set_{len(classes)}_landmarks", "n_classes": len(classes), "n_test": len(y), "n_test_groups": len(groups),
               "accuracy": float((pred == y).mean()), "macro_f1": report["macro avg"]["f1-score"],
               "top3_accuracy": float(np.any(np.argsort(p, axis=1)[:, -3:] == y[:, None], axis=1).mean()),
               "accuracy_group_bootstrap_95_ci": np.percentile(boot, [2.5, 97.5]).tolist(),
               "classification_report": report, "confusion_matrix": confusion_matrix(y, pred, labels=labels).tolist(),
               "confidence_before": probability_metrics(logits, targets),
               "confidence_after": probability_metrics(logits, targets, temperature),
               "latency_model_only_ms": {"p50": float(np.percentile(timings, 50)), "p95": float(np.percentile(timings, 95)), "n": len(timings)},
               "device": str(device), "ood_validated": False,
               "limitations": ["Tiny held-out test; results may not generalize to user photos.",
                               "pHash grouping does not exclude all same-source leakage without source metadata.",
                               "No OOD evaluation; the model always chooses one of the supported classes.",
                               "Bootstrap interval can be degenerate with perfect/small samples; not a performance guarantee."]}
    training_labels = [r["class_key"] for r in rows if r["split"] == "train" and not r["excluded_reason"]]
    majority = max(names, key=training_labels.count)
    metrics["majority_baseline"] = {"class_key": majority, "test_accuracy": float((y == names.index(majority)).mean())}
    write_json(bundle / "metrics.json", metrics)
    dest = ROOT / "reports" / bundle.name
    dest.mkdir(parents=True, exist_ok=True)
    write_json(dest / "metrics.json", metrics)
    with (dest / "per_class_metrics.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, ["class_key", "precision", "recall", "f1-score", "support"])
        writer.writeheader()
        writer.writerows({"class_key": name, **report[name]} for name in names)
    with (dest / "test_predictions.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, ["relative_path", "group_id", "true_label", "predicted_label", "confidence", "correct"])
        writer.writeheader()
        writer.writerows({"relative_path": r["relative_path"], "group_id": r["group_id"], "true_label": names[y[i]],
                          "predicted_label": names[pred[i]], "confidence": float(p[i].max()), "correct": bool(y[i] == pred[i])}
                         for i, r in enumerate(test_rows))
    fig, ax = plt.subplots(figsize=(max(10, len(classes)*0.8), max(8, len(classes)*0.7)))
    ConfusionMatrixDisplay.from_predictions(y, pred, labels=labels, display_labels=names, xticks_rotation=45, ax=ax, colorbar=False)
    fig.tight_layout()
    fig.savefig(dest / "confusion_matrix.png", dpi=160)
    plt.close(fig)
    fig, axes = plt.subplots(math.ceil(len(test_rows)/4), 4, figsize=(13, math.ceil(len(test_rows)/4)*2.8), squeeze=False)
    for i, ax in enumerate(axes.flat):
        ax.axis("off")
        if i >= len(test_rows):
            continue
        image = open_rgb(Path(cfg["dataset_root"]) / test_rows[i]["relative_path"])
        image.thumbnail((400, 300))
        ax.imshow(image)
        ax.set_title(f"True: {names[y[i]]}\nPred: {names[pred[i]]} ({p[i].max():.1%})", fontsize=8,
                     color="green" if pred[i] == y[i] else "crimson")
        image.close()
    fig.tight_layout()
    fig.savefig(dest / "test_examples.png", dpi=130)
    plt.close(fig)
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.plot([0, 1], [0, 1], "--", color="gray", label="ideal")
    for label, metric in [("before", metrics["confidence_before"]), ("after", metrics["confidence_after"])]:
        points = [r for r in metric["reliability"] if r["count"]]
        ax.plot([r["confidence"] for r in points], [r["accuracy"] for r in points], "o-", label=label)
    ax.set(xlabel="mean confidence", ylabel="accuracy", xlim=(0, 1), ylim=(0, 1), title=f"Test reliability (n={len(y)}; small sample)")
    ax.legend()
    fig.tight_layout()
    fig.savefig(dest / "reliability.png", dpi=150)
    plt.close(fig)
    history = read_json(bundle / "history.json")
    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    for ax, metric in zip(axes, ("loss", "accuracy")):
        ax.plot([r["epoch"] for r in history], [r[f"train_{metric}"] for r in history], label="train")
        ax.plot([r["epoch"] for r in history], [r[f"val_{metric}"] for r in history], label="validation")
        ax.set(xlabel="epoch", ylabel=metric)
        ax.legend()
    fig.tight_layout()
    fig.savefig(dest / "learning_curves.png", dpi=160)
    plt.close(fig)
    summary = f"""# Báo cáo baseline {bundle.name}

- Test: {len(y)} ảnh / {len(groups)} nhóm.
- Accuracy: {metrics['accuracy']:.2%}.
- Macro-F1: {metrics['macro_f1']:.4f}.
- Top-3 accuracy: {metrics['top3_accuracy']:.2%}.
- Calibration: {read_json(bundle / 'calibration.json')['n']} ảnh, temperature = {temperature:.4f}.
- Latency chỉ model ({device}): p50 {metrics['latency_model_only_ms']['p50']:.1f} ms, p95 {metrics['latency_model_only_ms']['p95']:.1f} ms.

Đây là đánh giá chọn một trong {len(classes)} địa điểm. Chưa đánh giá ảnh ngoài danh sách; không dùng confidence để bảo đảm ảnh là một địa điểm được hỗ trợ. Test còn nhỏ, chưa có metadata nguồn để loại mọi rò rỉ cùng nguồn. Cần ảnh mới độc lập và OOD trước khi dùng sản phẩm thực tế.

Xem `metrics.json`, `test_predictions.csv`, `confusion_matrix.png` và `learning_curves.png` cùng thư mục. Test không dùng chọn checkpoint hoặc temperature.
"""
    summary += "\n| Địa điểm | Precision | Recall | F1 | Số ảnh test |\n| --- | ---: | ---: | ---: | ---: |\n"
    for c in classes:
        r = report[c["class_key"]]
        summary += f"| {c['display_name']} | {r['precision']:.3f} | {r['recall']:.3f} | {r['f1-score']:.3f} | {int(r['support'])} |\n"
    (dest / "REPORT.md").write_text(summary, encoding="utf-8")
    export_csv(bundle, dest)
    print(json.dumps({k: metrics[k] for k in ("n_test", "accuracy", "macro_f1", "top3_accuracy", "latency_model_only_ms")}), flush=True)
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["train", "evaluate", "all"])
    parser.add_argument("--device", choices=["auto", "cpu", "cuda"], default="auto")
    parser.add_argument("--fine-tune-epochs", type=int)
    parser.add_argument("--config", type=Path)
    args = parser.parse_args()
    cfg = config(args.config) if args.config else config()
    device = device_for(args.device)
    bundle = ROOT / "models" / cfg["model_version"]
    if args.command in ("train", "all"):
        fine_tune_epochs = args.fine_tune_epochs if args.fine_tune_epochs is not None else cfg.get("fine_tune_epochs", 0)
        bundle = train(cfg, device, fine_tune_epochs)
    if args.command in ("evaluate", "all"):
        evaluate(bundle, cfg, device)
