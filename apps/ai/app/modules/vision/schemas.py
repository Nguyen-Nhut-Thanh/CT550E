from pydantic import BaseModel, Field
from app.schemas import RecommendedTour


class VisionRecognizeRequest(BaseModel):
    image_url: str | None = Field(default=None, description="URL of the landmark or scenic photo")
    image_base64: str | None = Field(default=None, description="Base64 encoded image string (optional alternative to URL)")


class LandmarkDetails(BaseModel):
    name: str = Field(..., description="Tên địa danh/di tích (ví dụ: Chùa Cầu, Fansipan, Hồ Hoàn Kiếm)")
    city_province: str = Field(..., description="Tỉnh/Thành phố hoặc Quốc gia")
    description: str = Field(..., description="Mô tả tóm tắt nét đặc trưng của địa danh")
    highlights: list[str] = Field(default_factory=list, description="Các điểm nổi bật khi ghé thăm")


class VisionRecognizeResponse(BaseModel):
    landmark: LandmarkDetails
    matched_tours: list[RecommendedTour] = Field(default_factory=list, description="Các tour du lịch đi qua địa danh này")
    message: str = ""

