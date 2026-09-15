from __future__ import annotations

from datetime import date, timedelta
from typing import Literal

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="Agrolink AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CropPredictionRequest(BaseModel):
    soilType: str = Field(min_length=1)
    season: str = Field(min_length=1)
    landArea: float = Field(gt=0)
    rainfallMm: float = Field(gt=0)


class DemandPredictionRequest(BaseModel):
    productName: str = Field(min_length=1)
    currentStock: float = Field(gt=0)
    historicalWeeklySales: float = Field(gt=0)
    seasonalFactor: float = Field(gt=0)


class YieldPredictionRequest(BaseModel):
    crop: str = Field(min_length=1)
    landArea: float = Field(gt=0)
    rainfallMm: float = Field(gt=0)
    fertilizerKgPerAcre: float = Field(gt=0)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)


class CropPredictionResponse(BaseModel):
    crop: str
    confidence: float
    explanation: str
    expectedYieldPerAcre: float


class DemandPredictionResponse(BaseModel):
    productName: str
    predictedWeeklyDemand: float
    reorderQuantity: float
    recommendation: str


class YieldPredictionResponse(BaseModel):
    crop: str
    yieldPerAcre: float
    totalExpectedYield: float
    unit: Literal["quintal"]
    explanation: str


class ChatResponse(BaseModel):
    answer: str
    source: str = "agrolink-ai"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agrolink-ai"}


@app.post("/predict/crop", response_model=CropPredictionResponse)
def predict_crop(request: CropPredictionRequest) -> CropPredictionResponse:
    soil = request.soilType.lower()
    season = request.season.lower()

    if "alluvial" in soil and "winter" in season:
        crop = "Wheat"
    elif "monsoon" in season or "rain" in season:
        crop = "Rice"
    elif "black" in soil:
        crop = "Cotton"
    else:
        crop = "Maize"

    rainfall_score = 1.0 if 500 <= request.rainfallMm <= 1000 else 0.82
    confidence = round(min(0.96, 0.72 + (0.1 if rainfall_score == 1.0 else 0)), 2)
    expected_yield = round(_base_yield(crop) * rainfall_score, 2)
    return CropPredictionResponse(
        crop=crop,
        confidence=confidence,
        explanation="Rule-based agronomic estimate using soil, season and rainfall.",
        expectedYieldPerAcre=expected_yield,
    )


@app.post("/predict/demand", response_model=DemandPredictionResponse)
def predict_demand(request: DemandPredictionRequest) -> DemandPredictionResponse:
    predicted = round(request.historicalWeeklySales * request.seasonalFactor, 2)
    reorder = round(max(0.0, predicted - request.currentStock), 2)
    recommendation = (
        "Reorder recommended" if reorder > 0 else "Current stock is sufficient"
    )
    return DemandPredictionResponse(
        productName=request.productName,
        predictedWeeklyDemand=predicted,
        reorderQuantity=reorder,
        recommendation=recommendation,
    )


@app.post("/predict/yield", response_model=YieldPredictionResponse)
def predict_yield(request: YieldPredictionRequest) -> YieldPredictionResponse:
    crop = request.crop.strip()
    rainfall_factor = 1.1 if 500 <= request.rainfallMm <= 1000 else 0.85
    fertilizer_factor = min(1.2, 0.9 + request.fertilizerKgPerAcre / 200)
    per_acre = round(_base_yield(crop) * rainfall_factor * fertilizer_factor, 2)
    return YieldPredictionResponse(
        crop=crop,
        yieldPerAcre=per_acre,
        totalExpectedYield=round(per_acre * request.landArea, 2),
        unit="quintal",
        explanation="Rule-based estimate using crop, rainfall and fertilizer input.",
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: Request) -> ChatResponse:
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    query_question = request.query_params.get("question", "")
    context = request.query_params.get("context", "")
    if isinstance(payload, dict):
        question = str(payload.get("question") or payload.get("message") or query_question)
    else:
        question = str(payload or query_question)
    question = question.lower()
    if context:
        answer = _answer_from_website_data(question, context)
    elif "demand" in question or "sell" in question:
        answer = "Demand is strongest for fresh, consistently supplied produce. Check the demand forecast before listing stock."
    elif "price" in question or "pricing" in question or "rate" in question or "mandi" in question:
        answer = "Use the pricing forecast to compare current mandi rates with the expected six-month trend before you quote."
    elif "delivery" in question or "order" in question:
        answer = "Orders move through confirmation, packing, shipment and delivery tracking in Agrolink."
    else:
        answer = "I can help with crop recommendations, demand, pricing, orders and delivery."
    return ChatResponse(answer=answer)


def _answer_from_website_data(question: str, context: str) -> str:
    stats_part, _, products_part = context.partition(";products=")
    stats = dict(
        item.split("=", 1)
        for item in stats_part.removeprefix("stats|").split("|")
        if "=" in item
    )
    products = []
    for row in products_part.split(";"):
        fields = row.split("~")
        if len(fields) == 4:
            products.append({"name": fields[0], "price": fields[1], "unit": fields[2], "stock": fields[3]})

    for product in products:
        product_words = [word for word in product["name"].lower().split() if len(word) > 3]
        if any(word in question for word in product_words):
            return (
                f"Live Agrolink data: {product['name']} is listed at Rs {product['price']} "
                f"per {product['unit']}, with {product['stock']} {product['unit']} currently available."
            )

    if any(word in question for word in ("price", "pricing", "rate", "mandi", "cost")):
        return (
            f"Based on the live website catalog, {stats.get('listings', '0')} produce listings "
            f"are available and the average listed price is Rs {stats.get('averagePrice', '0.00')}."
        )
    if any(word in question for word in ("demand", "sell", "stock", "inventory", "order")):
        return (
            f"Based on live website data, there are {stats.get('listings', '0')} listings and "
            f"{stats.get('orderedUnits', '0')} units in non-cancelled orders. Use the Demand page "
            "for the forecast by product."
        )
    return (
        f"I checked the live Agrolink website data: {stats.get('listings', '0')} listings, "
        f"average price Rs {stats.get('averagePrice', '0.00')}, and "
        f"{stats.get('orderedUnits', '0')} ordered units. Ask about a product, price, stock or demand."
    )


def _base_yield(crop: str) -> float:
    values = {
        "wheat": 18.0,
        "rice": 22.0,
        "maize": 20.0,
        "potato": 60.0,
        "cotton": 12.0,
    }
    return values.get(crop.lower(), 15.0)
