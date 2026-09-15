from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.price_service import predict_price


router = APIRouter()


# =========================================================
# REQUEST MODEL
# =========================================================

class PriceRequest(BaseModel):

    commodity: str
    market: str
    date: str


# =========================================================
# PRICE API
# =========================================================

@router.post("/predict/price")
def predict_price_api(
    request: PriceRequest
):

    try:

        result = predict_price(
            commodity=request.commodity,
            market=request.market,
            date=request.date
        )

        return result

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