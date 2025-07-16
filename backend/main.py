from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import random
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TWELVE_DATA_API_KEY = "f2a0a9782d4e4e4b9f7f86416c3055f0"
prediction_log = []  # temporary in-memory store

class PredictRequest(BaseModel):
    symbol: str
    price: float

@app.post("/predict")
def predict_stock(data: PredictRequest):
    change = round(random.uniform(-2, 2), 2)
    direction = "up" if change >= 0 else "down"
    timestamp = time.time()

    # Log the prediction
    prediction_log.append({
        "symbol": data.symbol,
        "initial_price": data.price,
        "predicted_change": change,
        "direction": direction,
        "timestamp": timestamp
    })

    return {
        "symbol": data.symbol,
        "direction": direction,
        "confidence": abs(change),
        "change": change,
    }
@app.get("/stocks")
def get_stock_prices():
    symbols = ["AAPL", "TSLA", "GOOG"]
    prices = []

    for symbol in symbols:
        url = f"https://api.twelvedata.com/price?symbol={symbol}&apikey={TWELVE_DATA_API_KEY}"
        try:
            res = requests.get(url, timeout=3)
            data = res.json()
            if "price" in data and data["price"] is not None:
                prices.append({"symbol": symbol, "price": float(data["price"])})
            else:
                prices.append({"symbol": symbol, "price": None})
        except Exception as e:
            prices.append({"symbol": symbol, "price": None})

    return prices
