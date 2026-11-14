import io
import sys
from pathlib import Path

import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from main import app, decode_upload
from fastapi import HTTPException
from fastapi.testclient import TestClient
from src.common import ROOT, config, read_json
from src.landmarks.data import load_rows, validate_manifest


def png_bytes(size=(128, 128)):
    buf = io.BytesIO()
    Image.new("RGB", size, "navy").save(buf, format="PNG")
    return buf.getvalue()


def test_decode_actual_content_and_limits():
    assert decode_upload(png_bytes()).size == (128, 128)
    for content in (b"not an image", b"", png_bytes((32, 128))):
        with pytest.raises(HTTPException) as err:
            decode_upload(content)
        assert err.value.status_code == 400
    with pytest.raises(HTTPException) as err:
        decode_upload(png_bytes((5001, 5000)))
    assert err.value.status_code == 413


def test_no_group_or_exact_hash_leakage():
    classes = read_json(ROOT / "manifests" / "classes.json")
    rows = load_rows()
    validate_manifest(rows, [c["class_key"] for c in classes])
    assert len(classes) == 15
    assert {c["class_key"] for c in classes} == set(config()["classes"])
    assert all(r["source_partition"] == ("test" if r["split"] == "test" else "train")
               for r in rows if not r["excluded_reason"])
    assert all(r["class_key"] != "overview" for r in rows)
    # Demonstrate that the check catches actual cross-split contamination.
    kept = [r.copy() for r in rows if not r["excluded_reason"]]
    copied = kept[0].copy()
    copied["split"] = "test" if copied["split"] != "test" else "train"
    with pytest.raises(ValueError, match="leakage"):
        validate_manifest([*kept, copied], [c["class_key"] for c in classes])


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        assert test_client.get("/ready").status_code == 200, "Train the real model before integration tests"
        yield test_client


def test_service_and_real_inference(client):
    assert client.get("/").status_code == 200
    assert client.get("/health").json()["status"] == "alive"
    info = client.get("/model/info").json()
    assert client.get("/api/v1/landmarks/info").json() == info
    assert info["embedding_dim"] == 2048
    assert info["ood_validated"] is False
    assert len(info["classes"]) == 15
    assert info["model_version"] == config()["model_version"]
    root = Path(config()["dataset_root"])
    row = next(r for r in load_rows() if r["split"] == "test")
    path = root / row["relative_path"]
    for endpoint in ("/predict", "/api/v1/landmarks/predict"):
        response = client.post(endpoint, files={"image": (path.name, path.read_bytes(), "image/jpeg")})
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["status"] == "closed_set_prediction"
        assert body["prediction"]["class_key"] in {c["class_key"] for c in info["classes"]}
        assert len(body["candidates"]) == 3
        assert 0 <= body["prediction"]["confidence"] <= 1
        assert body["request_id"] == response.headers["x-request-id"]
        assert body["inference_ms"] > 0


def test_upload_errors(client):
    assert client.post("/predict").status_code == 422
    assert client.post("/predict", files={"image": ("x.txt", b"hello", "text/plain")}).status_code == 415
    fake = client.post("/predict", files={"image": ("x.jpg", b"hello", "image/jpeg")})
    assert fake.status_code == 400
    assert "request_id" in fake.json()
    oversized = b"x" * (10*1024*1024+1)
    assert client.post("/predict", files={"image": ("large.jpg", oversized, "image/jpeg")}).status_code == 413
    assert client.post("/predict", files={"image": ("small.png", png_bytes((32, 64)), "image/png")}).status_code == 400
    # Streaming body with no Content-Length must be limited before multipart parsing.
    response = client.post("/predict", content=(b"x"*1024*1024 for _ in range(12)), headers={"Content-Type": "application/octet-stream"})
    assert response.status_code == 413


def test_not_ready_is_distinct_from_invalid_image(client):
    saved = app.state.predictor
    try:
        app.state.predictor = None
        assert client.get("/health").status_code == 200
        assert client.get("/ready").status_code == 503
        assert client.post("/predict", files={"image": ("x.png", png_bytes(), "image/png")}).status_code == 503
    finally:
        app.state.predictor = saved
