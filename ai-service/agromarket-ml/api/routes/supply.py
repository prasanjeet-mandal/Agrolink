from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supply_service import find_supply

router = APIRouter()


class SupplyRequest(BaseModel):
    product: str
    state: str
    min_arrival_tonnes: float = 0


@router.post("/predict/supply")
def predict_supply_api(request: SupplyRequest):
    try:
        return find_supply(
            product=request.product,
            state=request.state,
            min_arrival_tonnes=request.min_arrival_tonnes
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
