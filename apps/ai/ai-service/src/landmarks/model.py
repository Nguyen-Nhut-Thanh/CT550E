import torch
from torch import nn
from torch.utils.data import Dataset
from torchvision import models, transforms

from src.common import open_rgb

WEIGHTS = models.ResNet50_Weights.IMAGENET1K_V2
PREPROCESSING = {"weights": "IMAGENET1K_V2", "resize_short_edge": 232, "crop_size": 224,
                 "mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225],
                 "exif_transpose": True, "alpha_background": "white", "color_mode": "RGB"}


def device_for(name="auto"):
    if name == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if name == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA requested but unavailable")
    return torch.device(name)


def build_model(classes, pretrained=False):
    model = models.resnet50(weights=WEIGHTS if pretrained else None)
    model.fc = nn.Linear(model.fc.in_features, classes)
    return model


def features(model, x):
    x = model.maxpool(model.relu(model.bn1(model.conv1(x))))
    x = model.layer4(model.layer3(model.layer2(model.layer1(x))))
    return torch.flatten(model.avgpool(x), 1)


def transform(training=False):
    if not training:
        return WEIGHTS.transforms()
    return transforms.Compose([
        transforms.Resize(256),
        transforms.RandomResizedCrop(224, scale=(0.80, 1.0), ratio=(0.9, 1.1)),
        transforms.RandomRotation(5),
        transforms.ColorJitter(brightness=0.12, contrast=0.12, saturation=0.10),
        transforms.ToTensor(), transforms.Normalize(PREPROCESSING["mean"], PREPROCESSING["std"]),
    ])


class ManifestDataset(Dataset):
    def __init__(self, rows, root, classes, split, training=False):
        from pathlib import Path
        self.rows = [r for r in rows if r["split"] == split and not r["excluded_reason"]]
        self.root = Path(root)
        self.mapping = {c["class_key"]: c["index"] for c in classes}
        self.transform = transform(training)

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, i):
        row = self.rows[i]
        return self.transform(open_rgb(self.root / row["relative_path"])), self.mapping[row["class_key"]]
