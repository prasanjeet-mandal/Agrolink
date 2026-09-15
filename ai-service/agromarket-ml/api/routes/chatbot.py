from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.chatbot_service import chatbot_response


router = APIRouter()


class ChatRequest(BaseModel):

    message: str


@router.post("/chat")
def chat(request: ChatRequest):

    try:

        if not request.message.strip():

            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty."
            )

        return chatbot_response(
            request.message
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )