import logging
from fastapi import APIRouter, Depends, HTTPException
from asyncpg import Pool, PostgresError

from app.database import get_db
from app.modules.comparison.schemas import CompareRequest, CompareResponse
from app.modules.comparison.compare_service import compare_tours

router = APIRouter(prefix="/tours", tags=["Comparison"])
logger = logging.getLogger(__name__)


@router.post('/compare', response_model=CompareResponse)
async def compare_tours_endpoint(request: CompareRequest, db: Pool = Depends(get_db)) -> CompareResponse:
    try:
        return await compare_tours(db, request)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except (PostgresError, OSError, TimeoutError) as e:
        logger.warning('Comparison database error: %s', e)
        raise HTTPException(503, 'Không thể truy xuất dữ liệu tour để so sánh.')
    except Exception as e:
        logger.exception('Comparison failed: %s', e)
        raise HTTPException(500, 'Đã xảy ra lỗi khi so sánh tour.')

