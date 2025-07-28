from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select
import requests, random, time

from models import Prediction
from database import engine, create_db_and_tables
from typing import Dict

# Cache to store last known prices
cached_prices: Dict[str, float] = {}


app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust for frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# API Key for Twelve Data
TWELVE_DATA_API_KEY = "f2a0a9782d4e4e4b9f7f86416c3055f0"

# Request body for predictions
class PredictRequest(BaseModel):
    symbol: str
    price: float

# 🔮 Endpoint: Predict stock direction
@app.post("/predict")
def predict(data: PredictRequest):
    if data.price is None or not isinstance(data.price, (int, float)):
        raise HTTPException(status_code=400, detail="Invalid or missing price.")

    with Session(engine) as session:
        existing = session.exec(
            select(Prediction).where(Prediction.symbol == data.symbol, Prediction.validated == False)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Wait for previous prediction to be validated")

        change = round(random.uniform(-2, 2), 2)
        direction = "up" if change >= 0 else "down"

        new_pred = Prediction(
            symbol=data.symbol,
            initial_price=data.price,
            predicted_change=change,
            direction=direction,
            timestamp=time.time(),
            validated=False
        )
        session.add(new_pred)
        session.commit()
        session.refresh(new_pred)

        return {
            "symbol": data.symbol,
            "direction": direction,
            "confidence": abs(change),
            "change": change
        }


# 📈 Endpoint: Get live stock prices
@app.get("/stocks")
@app.get("/stocks")
def get_stocks():
    symbols = ["AAPL", "TSLA", "GOOG"]
    prices = []

    for symbol in symbols:
        url = f"https://api.twelvedata.com/price?symbol={symbol}&apikey={TWELVE_DATA_API_KEY}"
        try:
            res = requests.get(url, timeout=3)
            data = res.json()
            if "price" in data and data["price"]:
                price = float(data["price"])
                cached_prices[symbol] = price  # ✅ Update cache
            else:
                price = cached_prices.get(symbol)
        except Exception:
            price = cached_prices.get(symbol)

        prices.append({"symbol": symbol, "price": price})

    return prices


# ✅ Endpoint: Check prediction accuracy
@app.get("/accuracy")
def check_accuracy():
    results = []
    with Session(engine) as session:
        predictions = session.exec(select(Prediction)).all()
        for pred in predictions:
            url = f"https://api.twelvedata.com/price?symbol={pred.symbol}&apikey={TWELVE_DATA_API_KEY}"
            try:
                res = requests.get(url, timeout=3)
                data = res.json()
                if "price" in data and data["price"]:
                    current_price = float(data["price"])
                    cached_prices[pred.symbol] = current_price
                else:
                    current_price = cached_prices.get(pred.symbol)
                    if current_price is None:
                        continue  # skip if no previous known price

                current_price = float(data["price"])
                actual_direction = "up" if current_price >= pred.initial_price else "down"
                correct = actual_direction == pred.direction

                pred.validated = True
                pred.actual_price = current_price
                session.add(pred)

                results.append({
                    "symbol": pred.symbol,
                    "timestamp": pred.timestamp,
                    "initial_price": pred.initial_price,
                    "predicted_direction": pred.direction,
                    "actual_direction": actual_direction,
                    "correct": correct,
                    "current_price": current_price
                })
            except:
                continue
        session.commit()
    return results

# 🕒 Endpoint: Get 30-day historical price data
@app.get("/history")
def get_history(symbol: str = Query(...)):
    url = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=1day&outputsize=30&apikey={TWELVE_DATA_API_KEY}"
    try:
        res = requests.get(url, timeout=5)
        data = res.json()
        if "values" not in data:
            raise HTTPException(status_code=400, detail=data.get("message", "No data"))

        return [{"date": d["datetime"], "price": float(d["close"])} for d in data["values"]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
