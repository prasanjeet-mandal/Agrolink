from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.matching_service import find_matching_supply


router = APIRouter()


class MatchingRequest(BaseModel):
    product: str
    state: str
    date: str
    destination: str
    min_arrival_tonnes: float = 0


@router.post("/predict/matching")
def predict_matching_api(request: MatchingRequest):

    try:
        return find_matching_supply(
            product=request.product,
            state=request.state,
            date=request.date,
            min_arrival_tonnes=request.min_arrival_tonnes,
            destination=request.destination
        )

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
