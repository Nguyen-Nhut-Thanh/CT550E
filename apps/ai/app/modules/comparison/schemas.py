from typing import Any
from pydantic import BaseModel, Field


class CompareRequest(BaseModel):
    tour_ids: list[int] = Field(..., min_length=2, max_length=4, description="List of 2 to 4 tour IDs to compare")
    user_context: str | None = Field(default=None, description="Optional customer preference (e.g. đi với gia đình, thích nghỉ dưỡng)")


class ComparisonField(BaseModel):
    key: str
    label: str
    values: dict[str, Any]  # tour_id -> value string/number


class TourProsCons(BaseModel):
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    best_for: str = ""


class CompareResponse(BaseModel):
    tours: list[dict[str, Any]]
    matrix: list[ComparisonField]
    analysis: dict[str, TourProsCons]  # tour_id -> Pros & Cons
    ai_verdict: str  # AI advice: Which tour to choose for whom

