import hashlib
import json
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "configs" / "demo.json"


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")


def config(path=CONFIG):
    path = Path(path).resolve()
    cfg = read_json(path)
    cfg["dataset_root"] = str((path.parent / cfg["dataset_root"]).resolve())
    return cfg


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def seed_all(seed):
    import torch
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True


def open_rgb(path):
    with Image.open(path) as image:
        image.load()
        image = ImageOps.exif_transpose(image)
        if image.mode in ("RGBA", "LA") or "transparency" in image.info:
            rgba = image.convert("RGBA")
            bg = Image.new("RGBA", rgba.size, "white")
            image = Image.alpha_composite(bg, rgba)
        return image.convert("RGB")
