import pandas as pd
import joblib

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = BASE_DIR / "models" / "demand"

MODEL_FILE = MODEL_DIR / "tomato_arrival_model.pkl"
FEATURE_FILE = MODEL_DIR / "tomato_arrival_features.pkl"


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading Tomato Arrival Forecasting model...")

model = joblib.load(MODEL_FILE)
features = joblib.load(FEATURE_FILE)

print("Model loaded successfully.")


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_arrival(
    year,
    month,
    day,
    day_of_week,
    week_of_year,
    price_lag_1,
    price_lag_7,
    price_lag_30,
    arrival_lag_1,
    arrival_lag_7,
    price_rolling_mean_7,
    price_rolling_mean_30,
    arrival_rolling_mean_7
):

    input_data = pd.DataFrame(
        [{
            "year": year,
            "month": month,
            "day": day,
            "day_of_week": day_of_week,
            "week_of_year": week_of_year,

            "price_lag_1": price_lag_1,
            "price_lag_7": price_lag_7,
            "price_lag_30": price_lag_30,

            "arrival_lag_1": arrival_lag_1,
            "arrival_lag_7": arrival_lag_7,

            "price_rolling_mean_7": price_rolling_mean_7,
            "price_rolling_mean_30": price_rolling_mean_30,

            "arrival_rolling_mean_7": arrival_rolling_mean_7
        }]
    )

    # Same feature order as training
    input_data = input_data[features]

    prediction = model.predict(input_data)

    predicted_arrival = float(prediction[0])

    # Arrival negative nahi ho sakta
    predicted_arrival = max(0, predicted_arrival)

    return predicted_arrival


# ============================================================
# TEST PREDICTION
# ============================================================

if __name__ == "__main__":

    print("\n===================================")
    print("TOMATO ARRIVAL PREDICTION")
    print("===================================")

    prediction = predict_arrival(
        year=2026,
        month=9,
        day=5,
        day_of_week=5,
        week_of_year=36,

        price_lag_1=2000,
        price_lag_7=1950,
        price_lag_30=1900,

        arrival_lag_1=48,
        arrival_lag_7=52,

        price_rolling_mean_7=1975,
        price_rolling_mean_30=1925,

        arrival_rolling_mean_7=50
    )

    print(
        f"Predicted Tomato Arrival: "
        f"{prediction:.2f} tonnes"
    )

    print("===================================")