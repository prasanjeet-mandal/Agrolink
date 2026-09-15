from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.arrival_service import predict_arrival


router = APIRouter()


class ArrivalRequest(BaseModel):
    product: str
    state: str
    district: str
    date: str


@router.post("/predict/arrival")
def predict_arrival_api(request: ArrivalRequest):

    try:

        return predict_arrival(
            product=request.product,
            state=request.state,
            district=request.district,
            date=request.date
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