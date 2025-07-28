from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Prediction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str
    predicted_at: datetime = Field(default_factory=datetime.utcnow)
    predicted_price: float
    actual_price: Optional[float] = None
    was_correct: Optional[bool] = None
