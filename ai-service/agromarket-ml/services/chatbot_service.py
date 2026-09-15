import json
import re
from pathlib import Path

import ollama

from services.price_service import predict_price, compare_market_prices
from services.arrival_service import predict_arrival

from src.agriculture_rag import (
    build_context,
    detect_category
)


# =========================================================
# OLLAMA SETTINGS
# =========================================================

OLLAMA_MODEL = "qwen3:4b"


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[1]

FEATURE_DIR = (
    BASE_DIR
    / "data"
    / "processed"
    / "commodities"
)


# =========================================================
# COMMODITY ALIASES
# =========================================================

COMMODITY_ALIASES = {

    "onion": [
        "onion",
        "pyaaz",
        "pyaz"
    ],

    "potato": [
        "potato",
        "aloo",
        "alu"
    ],

    "tomato": [
        "tomato",
        "tamatar"
    ],

    "apple": [
        "apple",
        "seb"
    ],

    "rice": [
        "rice",
        "chawal"
    ],

    "paddy": [
        "paddy",
        "dhan"
    ],

    "wheat": [
        "wheat",
        "gehun",
        "gahu"
    ],

    "banana": [
        "banana",
        "kela"
    ],

    "mango": [
        "mango",
        "aam"
    ],

    "carrot": [
        "carrot",
        "gajar"
    ],

    "cabbage": [
        "cabbage",
        "patta gobhi",
        "band gobhi"
    ],

    "cauliflower": [
        "cauliflower",
        "gobhi"
    ],

    "brinjal": [
        "brinjal",
        "baingan"
    ],

    "peas": [
        "peas",
        "matar"
    ],

    "garlic": [
        "garlic",
        "lahsun",
        "lehsun"
    ]
}


# =========================================================
# AVAILABLE COMMODITIES
# =========================================================

def get_available_commodities():

    commodities = []

    if not FEATURE_DIR.exists():
        return commodities

    for file in FEATURE_DIR.glob("*_features.csv"):

        commodity = file.stem.replace("_features", "")

        commodities.append(commodity)

    return commodities


# =========================================================
# COMMODITY DETECTION
# =========================================================

def detect_commodity(message: str):

    text = message.lower().strip()

    available = get_available_commodities()

    # -----------------------------------------------------
    # First: exact dataset commodity names
    # -----------------------------------------------------

    sorted_commodities = sorted(
        available,
        key=len,
        reverse=True
    )

    for commodity in sorted_commodities:

        if commodity.lower() in text:

            return commodity

    # -----------------------------------------------------
    # Second: common Hindi aliases
    # -----------------------------------------------------

    for commodity, aliases in COMMODITY_ALIASES.items():

        for alias in aliases:

            if alias.lower() in text:

                # Find actual dataset commodity
                for available_commodity in available:

                    if (
                        available_commodity.lower()
                        == commodity.lower()
                    ):

                        return available_commodity

                # fallback
                return commodity.title()

    return None


# =========================================================
# MARKET DETECTION
# =========================================================

def detect_market(message: str):

    text = message.lower().strip()

    available_markets = set()

    if FEATURE_DIR.exists():

        for file in FEATURE_DIR.glob("*_features.csv"):

            try:

                import pandas as pd

                df = pd.read_csv(
                    file,
                    usecols=["market"]
                )

                for market in df["market"].dropna().unique():

                    available_markets.add(
                        str(market).strip()
                    )

            except Exception:
                continue

    # Longest market first
    sorted_markets = sorted(
        available_markets,
        key=len,
        reverse=True
    )

    for market in sorted_markets:

        if market.lower() in text:

            return market

    return None


# =========================================================
# JSON EXTRACTION
# =========================================================

def extract_json(text: str):

    try:

        return json.loads(text)

    except Exception:
        pass

    match = re.search(
        r"\{.*\}",
        text,
        re.DOTALL
    )

    if match:

        try:

            return json.loads(
                match.group()
            )

        except Exception:
            pass

    return None


# =========================================================
# OLLAMA INTENT DETECTION
# =========================================================

def ask_ollama_for_intent(message: str):

    prompt = f"""
Classify the user's agriculture chatbot question.

Return ONLY valid JSON.

Possible intents:

PRICE
PRICE_COMPARE
ARRIVAL
AGRICULTURE
GENERAL

Examples:

"tomato ka price kya hai"
=> PRICE

"tomato ka sabse sasta market batao"
=> PRICE_COMPARE

"potato mandi arrival kitna hai"
=> ARRIVAL

"tomato mein fertilizer kaise dena hai"
=> AGRICULTURE

"farmer ke liye kya advice hai"
=> AGRICULTURE

"hello"
=> GENERAL

User question:
{message}

JSON format:

{{
  "intent": "PRICE"
}}
"""

    response = ollama.chat(

        model=OLLAMA_MODEL,

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = extract_json(
        response.message.content
    )

    if result:

        return result.get(
            "intent",
            "GENERAL"
        )

    return "GENERAL"


# =========================================================
# GENERAL OLLAMA
# =========================================================

def ask_ollama(prompt: str):

    response = ollama.chat(

        model=OLLAMA_MODEL,

        messages=[

            {
                "role": "system",

                "content": (
                    "You are AgroMarket AI Assistant. "
                    "Answer only what the user asks. "
                    "Use simple Hinglish. "
                    "Keep answers short and practical. "
                    "Do not repeat the question. "
                    "For simple questions use 1-3 sentences."
                )
            },

            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.message.content.strip()


# =========================================================
# AGRICULTURE RAG + OLLAMA
# =========================================================

def ask_agriculture_rag(
    question: str,
    commodity=None
):

    category = detect_category(
        question
    )

    # -----------------------------------------------------
    # Retrieve knowledge
    # -----------------------------------------------------

    context = build_context(

        question,

        crop=commodity,

        category=category,

        top_k=5
    )

    # -----------------------------------------------------
    # No useful context
    # -----------------------------------------------------

    if not context:

        return ask_ollama(
            question
        )

    # -----------------------------------------------------
    # Send retrieved knowledge to Ollama
    # -----------------------------------------------------

    prompt = f"""
You are AgroMarket AI Agriculture Assistant.

User question:
{question}

Crop:
{commodity if commodity else "Not specified"}

Topic:
{category}

Retrieved agriculture knowledge:
{context}

Instructions:

1. Answer the user's question using the retrieved knowledge.
2. Use simple Hinglish.
3. Keep the answer practical and easy to understand.
4. Do not invent facts that are not supported by the retrieved knowledge.
5. Do not repeat the question.
6. If exact pesticide/fungicide/insecticide dose is not available,
   do NOT invent a dose.
7. For chemical treatment, advise checking the current approved
   product label or local agriculture/KVK recommendation.
8. Keep the answer around 2-5 sentences.
"""

    return ask_ollama(
        prompt
    )


# =========================================================
# CHATBOT
# =========================================================

def chatbot_response(message: str):

    text = message.lower().strip()

    if not text:

        return {
            "type": "error",
            "message": "Message cannot be empty."
        }

    # =====================================================
    # DETECT COMMODITY
    # =====================================================

    commodity = detect_commodity(
        message
    )

    # =====================================================
    # DETECT MARKET
    # =====================================================

    market = detect_market(
        message
    )

    # =====================================================
    # DATE
    # =====================================================

    # Current project testing date
    date = "2025-01-15"

    # =====================================================
    # INTENT
    # =====================================================

    try:

        intent_result = ask_ollama_for_intent(
            message
        )

        if isinstance(
            intent_result,
            dict
        ):

            intent = intent_result.get(
                "intent",
                "GENERAL"
            )

        else:

            intent = intent_result

    except Exception:

        intent = "GENERAL"

    intent = str(
        intent
    ).upper().strip()

    # =====================================================
    # FALLBACK KEYWORD DETECTION
    # =====================================================

    arrival_words = [
        "arrival",
        "arrivals",
        "supply",
        "mandi arrival",
        "kitna maal",
        "maal kitna"
    ]

    price_words = [
        "price",
        "rate",
        "bhav",
        "bhaav",
        "daam",
        "cost",
        "modal price",
        "kitne ka",
        "kitna hai"
    ]

    compare_words = [
        "cheapest",
        "cheapest market",
        "sasta market",
        "sabse sasta",
        "lowest price",
        "best market",
        "compare market",
        "market compare"
    ]

    agriculture_words = [
        "fertilizer",
        "khad",
        "irrigation",
        "pani",
        "water",
        "seed",
        "beej",
        "sowing",
        "buwai",
        "harvest",
        "harvesting",
        "disease",
        "rog",
        "insect",
        "keeda",
        "pest",
        "weed",
        "ghaas",
        "soil",
        "mitti",
        "cultivation",
        "farming",
        "farming kaise",
        "variety",
        "weather",
        "yield",
        "production",
        "nursery",
        "transplanting"
    ]

    if any(
        word in text
        for word in compare_words
    ):

        intent = "PRICE_COMPARE"

    elif any(
        word in text
        for word in arrival_words
    ):

        intent = "ARRIVAL"

    elif any(
        word in text
        for word in price_words
    ):

        intent = "PRICE"

    elif any(
        word in text
        for word in agriculture_words
    ):

        intent = "AGRICULTURE"

    # =====================================================
    # PRICE PREDICTION
    # =====================================================

    if intent == "PRICE":

        if not commodity:

            return {
                "type": "chat",
                "message": (
                    "Price batane ke liye "
                    "commodity ka naam batao."
                )
            }

        if not market:

            return {
                "type": "chat",
                "message": (
                    f"{commodity} ka price ke liye "
                    "market ka naam batao."
                )
            }

        try:

            result = predict_price(

                commodity=commodity,

                market=market,

                date=date
            )

            price = result[
                "predicted_modal_price"
            ]

            return {

                "type":
                    "price_prediction",

                "message": (
                    f"{commodity} ka expected price "
                    f"₹{price:.2f} per quintal hai."
                ),

                "data": result
            }

        except Exception as e:

            return {

                "type": "error",

                "message": str(e)
            }

    # =====================================================
    # PRICE COMPARISON
    # =====================================================

    if intent == "PRICE_COMPARE":

        if not commodity:

            return {

                "type": "chat",

                "message": (
                    "Market compare karne ke liye "
                    "commodity ka naam batao."
                )
            }

        try:

            result = compare_market_prices(

                commodity=commodity,

                date=date,

                top_n=5
            )

            cheapest = result[
                "cheapest_market"
            ]

            price = result[
                "cheapest_price"
            ]

            return {

                "type":
                    "price_comparison",

                "message": (
                    f"{commodity} ke liye "
                    f"{cheapest} market mein "
                    f"expected price sabse kam "
                    f"₹{price:.2f} per quintal hai."
                ),

                "data": result
            }

        except Exception as e:

            return {

                "type": "error",

                "message": str(e)
            }

    # =====================================================
    # ARRIVAL PREDICTION
    # =====================================================

    if intent == "ARRIVAL":

        if not commodity:

            return {

                "type": "chat",

                "message": (
                    "Arrival forecast ke liye "
                    "commodity ka naam batao."
                )
            }

        if not market:

            return {

                "type": "chat",

                "message": (
                    f"{commodity} ke arrival ke liye "
                    "market ka naam batao."
                )
            }

        try:

            result = predict_arrival(

                commodity=commodity,

                market=market,

                date=date
            )

            arrival = result[
                "predicted_arrival_tonnes"
            ]

            return {

                "type":
                    "arrival_prediction",

                "message": (
                    f"{commodity} ka expected mandi "
                    f"arrival {arrival:.2f} tonnes hai."
                ),

                "data": result
            }

        except Exception as e:

            return {

                "type": "error",

                "message": str(e)
            }

    # =====================================================
    # AGRICULTURE RAG
    # =====================================================

    if intent == "AGRICULTURE":

        try:

            answer = ask_agriculture_rag(

                question=message,

                commodity=commodity
            )

            return {

                "type":
                    "agriculture_rag",

                "message":
                    answer,

                "data": {

                    "commodity":
                        commodity,

                    "category":
                        detect_category(
                            message
                        )
                }
            }

        except Exception as e:

            return {

                "type": "error",

                "message": (
                    f"RAG error: {str(e)}"
                )
            }

    # =====================================================
    # GENERAL → OLLAMA
    # =====================================================

    try:

        answer = ask_ollama(
            message
        )

        return {

            "type": "chat",

            "message": answer
        }

    except Exception as e:

        return {

            "type": "error",

            "message": (
                f"Ollama error: {str(e)}"
            )
        }