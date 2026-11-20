import logging
from fastapi import APIRouter, Depends, HTTPException
from asyncpg import Pool

from app.database import get_db
from app.modules.vision.schemas import VisionRecognizeRequest, VisionRecognizeResponse
from app.modules.vision.vision_service import recognize_landmark

router = APIRouter(prefix="/vision", tags=["Vision AI"])
logger = logging.getLogger(__name__)


@router.post('/recognize', response_model=VisionRecognizeResponse)
async def recognize_landmark_endpoint(request: VisionRecognizeRequest, db: Pool = Depends(get_db)) -> VisionRecognizeResponse:
    try:
        return await recognize_landmark(db, request)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.exception('Vision landmark recognition failed: %s', e)
        raise HTTPException(500, 'Không thể nhận diện hình ảnh. Bạn vui lòng thử lại sau.')

