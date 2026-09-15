from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.price import router as price_router
from api.routes.arrival import router as arrival_router
from api.routes.route import router as route_router
from api.routes.chatbot import router as chatbot_router
from api.routes.demand import router as demand_router
from api.routes.supply import router as supply_router
from api.routes.matching import router as matching_router


app = FastAPI(
    title="AgroMarket AI/ML API",
    description="AI/ML services for AgroMarket",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(price_router)
app.include_router(arrival_router)
app.include_router(route_router)
app.include_router(chatbot_router)
app.include_router(demand_router)
app.include_router(supply_router)
app.include_router(matching_router)


@app.get("/")
def root():
    return {
        "message": "AgroMarket AI/ML API is running",
        "status": "success"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
