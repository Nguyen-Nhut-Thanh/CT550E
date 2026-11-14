"""Exercise the real localhost service with one held-out image from each class."""
import argparse
import mimetypes
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.common import ROOT, config, read_json, write_json
from src.landmarks.data import load_rows


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()
    cfg = config()
    root = Path(cfg["dataset_root"])
    bundle = ROOT / "models" / cfg["model_version"]
    rows = load_rows(bundle / "manifest.csv")
    results = []
    with httpx.Client(base_url=args.base_url, timeout=30) as client:
        client.get("/ready").raise_for_status()
        info = client.get("/model/info")
        info.raise_for_status()
        classes = read_json(bundle / "classes.json")
        assert info.json()["model_version"] == cfg["model_version"]
        assert info.json()["classes"] == classes
        for c in classes:
            row = next(r for r in rows if r["split"] == "test" and r["class_key"] == c["class_key"] and not r["excluded_reason"])
            path = root / row["relative_path"]
            response = client.post("/predict", files={"image": (path.name, path.read_bytes(), mimetypes.guess_type(path)[0])})
            response.raise_for_status()
            body = response.json()
            assert body["model_version"] == cfg["model_version"]
            assert body["prediction"]["class_key"] in cfg["classes"]
            assert len(body["candidates"]) == 3
            assert 0 <= body["prediction"]["confidence"] <= 1
            correct = body["prediction"]["class_key"] == c["class_key"]
            results.append({"image": row["relative_path"], "expected": c["class_key"], "correct": correct, "response": body})
            print(c["class_key"], body["prediction"]["class_key"], round(body["prediction"]["confidence"]*100, 2), flush=True)
    write_json(ROOT / "reports" / cfg["model_version"] / "api_smoke.json",
               {"passed": True, "n_correct": sum(case["correct"] for case in results), "cases": results, "model_info": info.json()})
    print(f"Actual HTTP upload/inference: {len(results)}/{len(results)} passed", flush=True)
