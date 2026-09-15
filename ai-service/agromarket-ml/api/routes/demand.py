from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.demand_service import predict_demand

router = APIRouter()


class DemandRequest(BaseModel):
    product: str
    state: str
    date: str


@router.post("/demand")
def predict_demand_api(request: DemandRequest):
    try:
        return predict_demand(
            product=request.product,
            state=request.state,
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