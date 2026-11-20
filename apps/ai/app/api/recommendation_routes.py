import logging
from fastapi import APIRouter, Depends, HTTPException
from asyncpg import Pool, PostgresError

from app.database import get_db
from app.modules.recommendation.schemas import RecommendationRequest, RecommendationResponse
from app.modules.recommendation.recommend_service import recommend_tours

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
logger = logging.getLogger(__name__)


@router.post('/hybrid', response_model=RecommendationResponse)
async def hybrid_recommendations_endpoint(request: RecommendationRequest, db: Pool = Depends(get_db)) -> RecommendationResponse:
    try:
        return await recommend_tours(db, request)
    except (PostgresError, OSError, TimeoutError) as e:
        logger.warning('Recommendation database error: %s', e)
        raise HTTPException(503, 'Không thể truy xuất dữ liệu gợi ý tour.')
    except Exception as e:
        logger.exception('Recommendation failed: %s', e)
        raise HTTPException(500, 'Đã xảy ra lỗi khi tạo gợi ý tour.')

