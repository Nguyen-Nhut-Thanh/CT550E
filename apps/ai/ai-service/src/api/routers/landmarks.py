"""HTTP endpoints for landmark recognition."""
import asyncio
import logging
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from starlette.concurrency import run_in_threadpool
from src.api.images import ALLOWED_MIME, MAX_BYTES, MAX_PIXELS, decode_upload

router = APIRouter(tags=["landmarks"])
LOG = logging.getLogger("ai-service.landmarks")


def ready(request: Request):
    if request.app.state.predictor is None:
        raise HTTPException(503, "Mô hình chưa sẵn sàng. Kiểm tra việc huấn luyện và bundle.")


@router.get("/info")
def info(request: Request):
    ready(request)
    p = request.app.state.predictor
    return {"model_version": p.version, "architecture": "resnet50", "classes": p.classes,
            "embedding_dim": 2048, "device": str(p.device), "calibrated": bool(p.calibration["calibrated"]),
            "calibration_samples": p.calibration["n"], "ood_validated": False,
            "max_bytes": MAX_BYTES, "max_pixels": MAX_PIXELS, "mode": "closed_set"}


@router.post("/predict")
async def predict(request: Request, image: UploadFile = File(...)):
    ready(request)
    try:
        if image.content_type not in ALLOWED_MIME:
            raise HTTPException(415, "MIME cần là JPEG, PNG hoặc WEBP.")
        data = bytearray()
        while chunk := await image.read(1024 * 1024):
            data.extend(chunk)
            if len(data) > MAX_BYTES:
                raise HTTPException(413, "Ảnh vượt quá 10 MB.")
        try:
            await asyncio.wait_for(request.app.state.semaphore.acquire(), timeout=1.0)
        except TimeoutError:
            raise HTTPException(429, "Đang xử lý ảnh khác. Vui lòng thử lại.")
        try:
            rgb = await run_in_threadpool(decode_upload, bytes(data))
            try:
                result = await run_in_threadpool(request.app.state.predictor.predict, rgb)
            finally:
                rgb.close()
            result["request_id"] = request.state.request_id
            return result
        except HTTPException:
            raise
        except Exception:
            LOG.exception("Inference failed, request_id=%s", request.state.request_id)
            raise HTTPException(500, "Không thể xử lý ảnh lúc này.")
        finally:
            request.app.state.semaphore.release()
    finally:
        await image.close()
