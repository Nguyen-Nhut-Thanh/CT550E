"""Download only the official fixed ResNet50 V2 checkpoint into the project cache."""
import hashlib
import os
import time
from pathlib import Path
import urllib.request

path = Path(__file__).resolve().parents[2] / ".cache" / "torch" / "hub" / "checkpoints" / "resnet50-11ad3fa6.pth"
path.parent.mkdir(parents=True, exist_ok=True)


def valid(file):
    return file.exists() and hashlib.sha256(file.read_bytes()).hexdigest().startswith("11ad3fa6")


if not valid(path):
    temp = path.with_suffix(".download")
    print("Downloading official ResNet50 V2 weights...", flush=True)
    last = [0.0]

    def progress(blocks, size, total):
        now = time.monotonic()
        if now-last[0] >= 15:
            print(f"Received {blocks*size/1024/1024:.1f} / {total/1024/1024:.1f} MB", flush=True)
            last[0] = now

    urllib.request.urlretrieve("https://download.pytorch.org/models/resnet50-11ad3fa6.pth", temp, reporthook=progress)
    if not valid(temp):
        raise RuntimeError("Checkpoint SHA256 prefix mismatch")
    os.replace(temp, path)
print(f"Verified: {path}", flush=True)
