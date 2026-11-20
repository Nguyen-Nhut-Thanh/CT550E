from fastapi import APIRouter
from app.api.chat_routes import router as chat_router
from app.api.comparison_routes import router as comparison_router
from app.api.vision_routes import router as vision_router
from app.api.recommendation_routes import router as recommendation_router
from app.api.health_routes import router as health_router

router = APIRouter()

router.include_router(chat_router)
router.include_router(comparison_router)
router.include_router(vision_router)
router.include_router(recommendation_router)
router.include_router(health_router)
