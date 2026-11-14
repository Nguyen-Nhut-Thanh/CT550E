"""Shared app, lifecycle, upload limits and exception handling."""
import asyncio
import logging
import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.formparsers import MultiPartParser
from src.common import ROOT
from src.landmarks.predictor import Predictor
from src.api.images import MAX_BYTES, decode_upload
from src.api.routers.landmarks import router, info, predict

LOG = logging.getLogger("ai-service")
MultiPartParser.spool_max_size = MAX_BYTES + 1


class BodyLimitMiddleware:
    """Reject oversized streaming bodies before multipart parsing or disk spooling."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope.get("method") != "POST":
            return await self.app(scope, receive, send)
        messages, total = [], 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            total += len(message.get("body", b""))
            if total > MAX_BYTES + 1024 * 1024:
                response = JSONResponse({"request_id": str(uuid.uuid4()), "error": {
                    "code": "upload_too_large", "message": "Tệp quá lớn."}}, status_code=413)
                return await response(scope, receive, send)
            messages.append(message)
            if not message.get("more_body", False):
                break
        iterator = iter(messages)

        async def replay():
            try:
                return next(iterator)
            except StopIteration:
                return await receive()
        await self.app(scope, replay, send)


@asynccontextmanager
async def lifespan(app):
    app.state.predictor = None
    app.state.semaphore = asyncio.Semaphore(2)
    try:
        app.state.predictor = await run_in_threadpool(Predictor, device=os.getenv("AI_DEVICE", "auto"))
    except Exception:
        LOG.exception("Could not load model bundle")
    yield
    app.state.predictor = None


app = FastAPI(title="Demo nhận diện địa điểm du lịch", lifespan=lifespan)
app.add_middleware(BodyLimitMiddleware)


@app.middleware("http")
async def limits_and_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    try:
        length = int(request.headers.get("content-length", "0"))
    except ValueError:
        return JSONResponse({"error": {"code": "invalid_length", "message": "Content-Length không hợp lệ."}, "request_id": request.state.request_id}, status_code=400)
    if length > MAX_BYTES + 1024 * 1024:
        return JSONResponse({"error": {"code": "upload_too_large", "message": "Tệp quá lớn."}, "request_id": request.state.request_id}, status_code=413)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


@app.exception_handler(StarletteHTTPException)
async def http_error(request, exc):
    return JSONResponse({"request_id": request.state.request_id,
                         "error": {"code": f"http_{exc.status_code}", "message": str(exc.detail)}}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(request, exc):
    return JSONResponse({"request_id": request.state.request_id,
                         "error": {"code": "invalid_request", "message": "Yêu cầu cần một tệp ảnh trong trường image."}}, status_code=422)


@app.get("/", include_in_schema=False)
def demo():
    return FileResponse(ROOT / "demo" / "index.html")


@app.get("/health")
def health():
    return {"status": "alive"}


@app.get("/ready")
def ready():
    if app.state.predictor is None:
        raise HTTPException(503, "Mô hình chưa sẵn sàng. Kiểm tra việc huấn luyện và bundle.")
    return {"status": "ready"}



app.include_router(router, prefix="/api/v1/landmarks")
# Compatibility paths used by the existing upload demo.
app.add_api_route("/model/info", info, methods=["GET"], tags=["landmarks"])
app.add_api_route("/predict", predict, methods=["POST"], tags=["landmarks"])
