from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TWELVE_DATA_API_KEY = "f2a0a9782d4e4e4b9f7f86416c3055f0"

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
