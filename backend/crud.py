from sqlmodel import Session, select
from models import Prediction
from database import engine

def save_prediction(pred: Prediction):
    with Session(engine) as session:
        session.add(pred)
        session.commit()
        session.refresh(pred)
        return pred

def get_latest_prediction(symbol: str):
    with Session(engine) as session:
        result = session.exec(
            select(Prediction).where(Prediction.symbol == symbol).order_by(Prediction.predicted_at.desc())
        ).first()
        return result

def update_actual_price(symbol: str, actual_price: float):
    with Session(engine) as session:
        pred = get_latest_prediction(symbol)
        if pred:
            pred.actual_price = actual_price
            pred.was_correct = abs(pred.predicted_price - actual_price) < 0.5  # Accuracy threshold
            session.add(pred)
            session.commit()
            session.refresh(pred)
            return pred
