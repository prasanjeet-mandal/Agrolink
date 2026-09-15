from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="Agrolink Optimization Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Stop(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    demand: float = Field(default=0, ge=0)


class RouteRequest(BaseModel):
    stops: List[Stop] = Field(min_length=1, max_length=100)
    start: Stop | None = None
    vehicleCapacity: float | None = Field(default=None, gt=0)
    averageSpeedKph: float = Field(default=35, gt=0, le=150)
    returnToStart: bool = True


class RouteResponse(BaseModel):
    orderedStops: List[Stop]
    distanceKm: float
    durationMinutes: int
    totalDemand: float
    capacityUtilizationPercent: float | None
    algorithm: str = "nearest-neighbor"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agrolink-optimization"}


@app.post("/optimize/route", response_model=RouteResponse)
def optimize_route(request: RouteRequest) -> RouteResponse:
    if request.vehicleCapacity is not None:
        total_demand = sum(stop.demand for stop in request.stops)
        if total_demand > request.vehicleCapacity:
            raise HTTPException(status_code=422, detail="Route demand exceeds vehicle capacity")
    else:
        total_demand = sum(stop.demand for stop in request.stops)

    origin = request.start or request.stops[0]
    remaining = list(request.stops)
    ordered: list[Stop] = []
    current = origin
    distance = 0.0

    while remaining:
        next_stop = min(remaining, key=lambda stop: _distance_km(current, stop))
        distance += _distance_km(current, next_stop)
        ordered.append(next_stop)
        remaining.remove(next_stop)
        current = next_stop

    if request.returnToStart and ordered:
        distance += _distance_km(current, origin)

    utilization = None
    if request.vehicleCapacity is not None:
        utilization = round(total_demand / request.vehicleCapacity * 100, 2)

    return RouteResponse(
        orderedStops=ordered,
        distanceKm=round(distance, 2),
        durationMinutes=max(1, round(distance / request.averageSpeedKph * 60)),
        totalDemand=round(total_demand, 2),
        capacityUtilizationPercent=utilization,
    )


def _distance_km(first: Stop, second: Stop) -> float:
    earth_radius_km = 6371.0
    lat_delta = radians(second.latitude - first.latitude)
    lon_delta = radians(second.longitude - first.longitude)
    first_lat = radians(first.latitude)
    second_lat = radians(second.latitude)
    a = sin(lat_delta / 2) ** 2 + cos(first_lat) * cos(second_lat) * sin(lon_delta / 2) ** 2
    return 2 * earth_radius_km * asin(sqrt(a))
