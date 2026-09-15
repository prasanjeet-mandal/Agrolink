import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "models", "demand", "demand_forecast_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "demand", "processed", "demand_features.csv")

_model_data = None
_data = None


def load_model():
    global _model_data

    if _model_data is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Demand model not found: {MODEL_PATH}")

        _model_data = joblib.load(MODEL_PATH)

    return _model_data


def load_data():
    global _data

    if _data is None:
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Demand feature data not found: {DATA_PATH}")

        _data = pd.read_csv(DATA_PATH, parse_dates=["Date"])

    return _data


def predict_demand(product: str, state: str, date: str):

    model_data = load_model()
    data = load_data()

    model = model_data["model"]
    features = model_data["features"]
    products = model_data["products"]
    states = model_data["states"]

    product_key = next(
        (p for p in products if p.lower() == product.strip().lower()),
        None
    )

    if product_key is None:
        raise ValueError(
            f"Unsupported product '{product}'. Available products: {list(products.keys())}"
        )

    state_key = next(
        (s for s in states if s.lower() == state.strip().lower()),
        None
    )

    if state_key is None:
        raise ValueError(
            f"Unsupported state '{state}'. Available states: {list(states.keys())}"
        )

    product = product_key
    state = state_key

    target_date = pd.to_datetime(date)

    history = data[
        (data["Product"].str.lower() == product.lower()) &
        (data["State"].str.lower() == state.lower())
    ].copy()

    if history.empty:
        raise ValueError(f"No historical demand data found for {product} / {state}")

    history = history.sort_values("Date")
    latest = history.iloc[-1]
    latest_date = pd.to_datetime(latest["Date"])

    if target_date < latest_date:
        raise ValueError(
            f"Forecast date {target_date.strftime('%Y-%m-%d')} is earlier than "
            f"the latest available historical date {latest_date.strftime('%Y-%m-%d')}."
        )

    input_data = {
        "product_code": products[product],
        "state_code": states[state],
        "year": target_date.year,
        "month": target_date.month,
        "day": target_date.day,
        "day_of_week": target_date.dayofweek,
        "week_of_year": int(target_date.isocalendar().week),
        "day_of_year": target_date.dayofyear,
        "lag_1": latest["lag_1"],
        "lag_7": latest["lag_7"],
        "lag_14": latest["lag_14"],
        "lag_30": latest["lag_30"],
        "rolling_mean_7": latest["rolling_mean_7"],
        "rolling_mean_30": latest["rolling_mean_30"],
        "rolling_std_7": latest["rolling_std_7"]
    }

    X = pd.DataFrame([input_data])
    X = X[features]

    prediction = model.predict(X)[0]
    prediction = max(0, float(prediction))

    return {
        "product": product,
        "state": state,
        "forecast_date": target_date.strftime("%Y-%m-%d"),
        "predicted_demand": round(prediction, 2),
        "unit": "units",
        "latest_historical_date": latest_date.strftime("%Y-%m-%d"),
        "latest_actual_demand": float(latest["Demand"])
    }
