from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get('/health')
async def health():
    return {
        'status': 'alive',
        'service': 'JourniTrip AI Platform',
        'modules': ['chatbot', 'comparison', 'vision', 'recommendations'],
        'openai_configured': bool(settings.OPENAI_API_KEY.get_secret_value().strip())
    }

