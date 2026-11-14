import argparse
import json
import sys
import time
import uuid
from pathlib import Path
from threading import Lock

import numpy as np
import torch
import torch.nn.functional as F

from src.common import ROOT, config, digest, open_rgb, read_json
from src.landmarks.model import PREPROCESSING, build_model, features, transform, device_for


class Predictor:
    def __init__(self, bundle=None, device="auto"):
        cfg = config()
        torch.set_num_threads(cfg["torch_threads"])
        self.bundle = Path(bundle or ROOT / "models" / cfg["model_version"])
        self.classes = read_json(self.bundle / "classes.json")
        if [c["index"] for c in self.classes] != list(range(len(self.classes))):
            raise ValueError("Invalid class indices")
        if len({c["class_key"] for c in self.classes}) != len(self.classes):
            raise ValueError("Duplicate class keys")
        if read_json(self.bundle / "preprocessing.json") != PREPROCESSING:
            raise ValueError("Unsupported preprocessing configuration")
        training_cfg = read_json(self.bundle / "training_config.json")
        if [c["class_key"] for c in self.classes] != sorted(training_cfg["classes"]):
            raise ValueError("Class mapping differs from training configuration")
        if any(c["display_name"] != training_cfg["classes"][c["class_key"]] for c in self.classes):
            raise ValueError("Display names differ from training configuration")
        self.version = training_cfg["model_version"]
        if digest(self.bundle / "best_model.pth") != read_json(self.bundle / "training_summary.json")["checkpoint_sha256"]:
            raise ValueError("Checkpoint checksum mismatch")
        self.calibration = read_json(self.bundle / "calibration.json")
        self.temperature = float(self.calibration["temperature"])
        if not 0.5 <= self.temperature <= 10:
            raise ValueError("Invalid temperature")
        self.device = device_for(device)
        self.model = build_model(len(self.classes)).to(self.device)
        self.model.load_state_dict(torch.load(self.bundle / "best_model.pth", map_location=self.device, weights_only=True))
        self.model.eval()
        self.transform = transform()
        self.lock = Lock()
        with np.load(self.bundle / "gallery_embeddings.npz", allow_pickle=False) as gallery:
            self.gallery = torch.from_numpy(gallery["embeddings"].copy())
            self.gallery_labels = torch.from_numpy(gallery["labels"].copy())
        if self.gallery.ndim != 2 or self.gallery.shape[1] != 2048 or len(self.gallery_labels) != len(self.gallery):
            raise ValueError("Invalid gallery shape")
        if set(self.gallery_labels.tolist()) != set(range(len(self.classes))):
            raise ValueError("Gallery class coverage differs from model classes")

    def predict(self, image):
        tick = time.perf_counter()
        x = self.transform(image)[None].to(self.device)
        with self.lock, torch.inference_mode():
            z = features(self.model, x)
            probabilities = torch.softmax(self.model.fc(z) / self.temperature, dim=1)[0].cpu()
            normalized = F.normalize(z, dim=1).cpu()
            values, indices = probabilities.topk(min(3, len(self.classes)))
            candidates = [{"class_key": self.classes[int(i)]["class_key"],
                           "display_name": self.classes[int(i)]["display_name"], "confidence": float(v)}
                          for v, i in zip(values, indices)]
            matching = self.gallery[self.gallery_labels == int(indices[0])]
            similarities = (matching @ normalized[0]).topk(min(3, len(matching))).values
        return {"request_id": str(uuid.uuid4()), "model_version": self.version,
                "status": "closed_set_prediction", "scope": "one_of_supported_classes",
                "prediction": candidates[0], "candidates": candidates,
                "calibrated": bool(self.calibration["calibrated"]), "ood_validated": False,
                "gallery_similarity": float(similarities.mean()),
                "inference_ms": round((time.perf_counter()-tick)*1000, 2),
                "warning": f"Mô hình luôn chọn một trong {len(self.classes)} địa điểm. Chưa kiểm chứng ảnh ngoài danh sách; độ tin cậy không phải tỷ lệ ảnh trùng nhau."}


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    args = parser.parse_args()
    print(json.dumps(Predictor(device=args.device).predict(open_rgb(args.image)), ensure_ascii=False, indent=2))
