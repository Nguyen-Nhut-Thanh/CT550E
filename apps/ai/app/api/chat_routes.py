import logging
from fastapi import APIRouter, Depends, HTTPException
from asyncpg import Pool, PostgresError

from app.database import get_db
from app.schemas import ChatRequest, ChatResponse
from app.clients.openai_client import OpenAIInvocationError
from app.modules.chatbot.rag_service import run_advanced_rag

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post('/chat', response_model=ChatResponse, response_model_exclude_none=True)
async def chat(request: ChatRequest, db: Pool = Depends(get_db)) -> ChatResponse:
    try:
        return await run_advanced_rag(db, request)
    except OpenAIInvocationError as error:
        logger.warning('OpenAI generation unavailable (status: %s)', error.status_code)
        if error.status_code in (401, 403):
            raise HTTPException(503, 'OpenAI chưa chấp nhận cấu hình API hiện tại.') from None
        if error.status_code == 429:
            raise HTTPException(503, 'OpenAI đang giới hạn lượt gọi hoặc tài khoản API đã hết hạn mức.') from None
        if error.status_code is None:
            raise HTTPException(503, 'Chưa kết nối được với OpenAI. Bạn thử lại sau nhé.') from None
        raise HTTPException(503, 'OpenAI đang gián đoạn. Bạn thử lại sau nhé.') from None
    except (PostgresError, OSError, TimeoutError) as error:
        logger.warning('Chat catalog unavailable: %s', type(error).__name__)
        raise HTTPException(503, 'Trợ lý chưa kết nối được dữ liệu tour.') from None
    except (ValueError, TypeError, AttributeError) as error:
        logger.warning('Invalid chat interpretation: %s', type(error).__name__)
        raise HTTPException(503, 'Trợ lý chưa hiểu được yêu cầu. Bạn thử diễn đạt ngắn hơn nhé.') from None

