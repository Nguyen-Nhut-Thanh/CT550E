from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=800)]
Label = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]
Count = Annotated[int, Field(ge=0, le=100)]
RecordId = Annotated[int, Field(gt=0, le=2_147_483_647)]
Topic = Literal["search", "details", "destination", "quote", "voucher"]


class Criteria(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    destination: Label | None = None
    departure: Label | None = None
    date_from: date | None = Field(None, alias="from")
    date_to: date | None = Field(None, alias="to")
    budget: int | None = Field(None, gt=0, le=1_000_000_000)
    duration_days: int | None = Field(None, alias="durationDays", gt=0, le=90)
    adults: Count | None = None
    children: Count | None = None
    infants: Count | None = None
    group_size: int | None = Field(None, alias="groupSize", gt=0, le=100)
    transport: Label | None = None
    preferences: Label | None = None
    tour_query: Label | None = Field(None, alias="tourQuery")

    @property
    def party_size(self) -> int:
        return max(1, self.group_size or 0, sum(self.counts))

    @property
    def counts(self) -> tuple[int, int, int]:
        return self.adults or 0, self.children or 0, self.infants or 0


class HistoryTurn(BaseModel):
    question: Text
    reply: Text


class VisibleTour(BaseModel):
    scheduleId: RecordId
    title: Label
    departureDate: datetime


class ChatRequest(BaseModel):
    message: Text
    criteria: Criteria = Field(default_factory=Criteria)
    previousScheduleIds: list[RecordId] = Field(default_factory=list, max_length=5)
    focusedScheduleId: RecordId | None = None
    topic: Topic | None = None
    history: list[HistoryTurn] = Field(default_factory=list, max_length=4)
    visibleTours: list[VisibleTour] = Field(default_factory=list, max_length=6)

    @property
    def focus(self) -> int | None:
        return self.focusedScheduleId or (self.previousScheduleIds[0] if len(self.previousScheduleIds) == 1 else None)


class RecommendedTour(BaseModel):
    id: int
    title: str
    url: str
    image_url: str | None = None
    price: float
    original_price: float
    duration: str
    schedule_id: int
    departure_date: datetime
    destination: str | None = None
    transport: str | None = None


class ChatResponse(BaseModel):
    reply: str
    tours: list[RecommendedTour] = Field(default_factory=list)
    criteria: Criteria
    previousScheduleIds: list[int] = Field(default_factory=list)
    focusedScheduleId: int | None = None
    topic: Topic | None = None
