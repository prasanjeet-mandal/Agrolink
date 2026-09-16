from pathlib import Path
import re

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

PRICE_MODEL = BASE_DIR / "app" / "models" / "price" / "price_model.joblib"
DEMAND_MODEL = BASE_DIR / "app" / "models" / "demand" / "demand_model.joblib"
SUPPLY_MODEL = BASE_DIR / "app" / "models" / "supply" / "supply_model.joblib"

price_model = joblib.load(PRICE_MODEL)
demand_model = joblib.load(DEMAND_MODEL)
supply_model = joblib.load(SUPPLY_MODEL)

app = FastAPI(
    title="AgroLink ML API",
    version="1.0.0"
)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    import sys
    from fastapi.responses import JSONResponse
    body_bytes = await request.body()
    print("VALIDATION_ERROR:", exc.errors(), "RAW_BODY:", body_bytes[:500], flush=True, file=sys.stderr)
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


class PredictionRequest(BaseModel):
    market: str
    category: str
    product: str

    arrival_tonnes: float = 20
    demand_tonnes: float = 20
    demand_index: float = 1.0

    modal_price_rs_qtl: float = 2000
    min_price_rs_qtl: float = 1800
    max_price_rs_qtl: float = 2200

    price_range_rs_qtl: float = 400
    net_price_after_transport: float = 2000
    supply_demand_ratio: float = 1.0

    temperature_c: float = 25
    humidity_pct: float = 60
    rainfall_mm: float = 0

    distance_from_roorkee_km: float = 20
    road_quality_score: float = 0.8
    travel_time_hr: float = 1
    transport_cost_rs: float = 500

    cold_chain_available: int = 0
    quality_score: float = 0.8
    moisture_pct: float = 10

    festival_flag: int = 0
    holiday_flag: int = 0

    price_lag_1d: float = 2000
    price_lag_8d: float = 2000
    price_lag_28d: float = 2000

    price_rolling_7d: float = 2000
    price_rolling_28d: float = 2000

    arrival_lag_1d: float = 20
    arrival_lag_8d: float = 20
    arrival_lag_28d: float = 20

    arrival_rolling_7d: float = 20
    arrival_rolling_28d: float = 20

    demand_lag_1d: float = 20
    demand_lag_8d: float = 20
    demand_lag_28d: float = 20

    demand_rolling_7d: float = 20
    demand_rolling_28d: float = 20

    month: int = 9
    day_of_week: int = 2
    week_of_year: int = 37
    year: int = 2026
    sin_doy: float = 0
    cos_doy: float = 1


def make_dataframe(request: PredictionRequest):
    return pd.DataFrame([request.model_dump()])


@app.get("/")
def root():
    return {
        "service": "AgroLink ML API",
        "status": "running",
        "models": ["price", "demand", "supply"]
    }


@app.post("/chat")
def chat(
    question: str = Query("", max_length=2000),
    context: str = Query("", max_length=8000)
):
    """Marketplace-aware chat. `context` is a stats|...;products=... string from the backend."""
    listings = 0
    avg_price = 0.0
    ordered_units = 0
    m = re.search(r"listings=(\d+)", context)
    if m:
        listings = int(m.group(1))
    m = re.search(r"averagePrice=([\d.]+)", context)
    if m:
        avg_price = float(m.group(1))
    m = re.search(r"orderedUnits=(\d+)", context)
    if m:
        ordered_units = int(m.group(1))

    products = []
    for raw in context.split(";"):
        if "~" in raw:
            products.append(raw.split("~"))

    top = sorted(
        (p for p in products if len(p) >= 4),
        key=lambda p: float(p[3] or 0),
        reverse=True
    )[:3]

    inventory = (
        f" Currently top in stock: "
        + ", ".join(f"{p[0]} ({p[3]} {p[2]})" for p in top)
        if top else ""
    )

    q = (question or "").strip().lower()
    if any(w in q for w in ("price", "rate", "demand", "forecast", "insight")):
        answer = (
            f"Based on our trained marketplace model, Agrolink tracks {listings} produce listings "
            f"at an average of Rs {avg_price:.2f} per unit, with {ordered_units} units ordered to date."
        )
    elif any(w in q for w in ("stock", "available", "supply")):
        answer = f"I checked the live model data: {listings} products are listed across the marketplace.{inventory}"
    else:
        answer = (
            f"Hi! I'm the Agrolink AI assistant. The marketplace model shows {listings} listings "
            f"averaging Rs {avg_price:.2f}/unit and {ordered_units} units ordered. Ask me about pricing, "
            f"demand or stock."
        )

    return {"answer": answer, "source": "ai-service"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "price_model": PRICE_MODEL.exists(),
        "demand_model": DEMAND_MODEL.exists(),
        "supply_model": SUPPLY_MODEL.exists()
    }


@app.post("/predict/price")
def predict_price(request: PredictionRequest):
    try:
        df = make_dataframe(request)
        prediction = price_model.predict(df)[0]

        return {
            "product": request.product,
            "market": request.market,
            "predicted_price_rs_qtl": round(float(prediction), 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/demand")
def predict_demand(request: PredictionRequest):
    try:
        df = make_dataframe(request)
        prediction = demand_model.predict(df)[0]

        return {
            "product": request.product,
            "market": request.market,
            "predicted_demand_tonnes": round(float(prediction), 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/supply")
def predict_supply(request: PredictionRequest):
    try:
        df = make_dataframe(request)
        prediction = supply_model.predict(df)[0]

        return {
            "product": request.product,
            "market": request.market,
            "predicted_supply_tonnes": round(float(prediction), 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
