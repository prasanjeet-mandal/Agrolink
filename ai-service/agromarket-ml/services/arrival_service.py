import os
import joblib
import pandas as pd
import numpy as np


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "arrival_global_clean",
    "arrival_global_clean_model.pkl"
)

ENCODER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "arrival_global_clean",
    "arrival_global_clean_encoder.pkl"
)

# Lightweight inference lookup
DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "demand",
    "processed",
    "arrival_inference_lookup_120.csv"
)


CATEGORICAL_COLS = [
    "product",
    "state",
    "district"
]


NUMERIC_COLS = [
    "year",
    "month",
    "day",
    "day_of_week",
    "week_of_year",
    "day_of_year",
    "quarter",
    "arrival_lag_1",
    "arrival_lag_7",
    "arrival_lag_14",
    "arrival_lag_30",
    "arrival_rolling_mean_7",
    "arrival_rolling_mean_14",
    "arrival_rolling_mean_30",
    "arrival_rolling_std_7",
    "arrival_rolling_std_30"
]


_model = None
_encoder = None
_data = None


def load_model():

    global _model

    if _model is None:

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Arrival model not found: {MODEL_PATH}"
            )

        _model = joblib.load(MODEL_PATH)

    return _model


def load_encoder():

    global _encoder

    if _encoder is None:

        if not os.path.exists(ENCODER_PATH):
            raise FileNotFoundError(
                f"Arrival encoder not found: {ENCODER_PATH}"
            )

        _encoder = joblib.load(ENCODER_PATH)

    return _encoder


def load_data():

    global _data

    if _data is None:

        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(
                f"Arrival inference lookup not found: {DATA_PATH}"
            )

        _data = pd.read_csv(
            DATA_PATH,
            parse_dates=["date"]
        )

    return _data


def predict_arrival(
    product: str,
    state: str,
    district: str,
    date: str
):

    model = load_model()
    encoder = load_encoder()
    data = load_data()

    target_date = pd.to_datetime(date)

    product = product.strip()
    state = state.strip()
    district = district.strip()


    # ---------------------------------------------------------
    # FIND LATEST HISTORICAL RECORD
    # ---------------------------------------------------------

    history = data[
        (data["product"].str.lower() == product.lower()) &
        (data["state"].str.lower() == state.lower()) &
        (data["district"].str.lower() == district.lower())
    ]

    if history.empty:

        raise ValueError(
            f"No historical data found for "
            f"{product} / {state} / {district}"
        )


    latest = history.sort_values(
        "date"
    ).iloc[-1]


    latest_date = pd.to_datetime(
        latest["date"]
    )


    # The compact lookup contains the latest available
    # historical record for this product/state/district.
    # It is intended for forecasting that date or later.

    if target_date < latest_date:

        raise ValueError(
            f"Forecast date {target_date.strftime('%Y-%m-%d')} "
            f"is earlier than the latest available historical date "
            f"{latest_date.strftime('%Y-%m-%d')}."
        )


    # ---------------------------------------------------------
    # CATEGORICAL FEATURES
    # ---------------------------------------------------------

    categorical_input = pd.DataFrame([
        {
            "product": product,
            "state": state,
            "district": district
        }
    ])


    encoded_categories = encoder.transform(
        categorical_input
    )


    # ---------------------------------------------------------
    # NUMERIC FEATURES
    # ---------------------------------------------------------

    numeric_input = pd.DataFrame([
        {
            "year": target_date.year,

            "month": target_date.month,

            "day": target_date.day,

            "day_of_week": target_date.dayofweek,

            "week_of_year": int(
                target_date.isocalendar().week
            ),

            "day_of_year": target_date.dayofyear,

            "quarter": target_date.quarter,

            "arrival_lag_1":
                latest["arrival_lag_1"],

            "arrival_lag_7":
                latest["arrival_lag_7"],

            "arrival_lag_14":
                latest["arrival_lag_14"],

            "arrival_lag_30":
                latest["arrival_lag_30"],

            "arrival_rolling_mean_7":
                latest["arrival_rolling_mean_7"],

            "arrival_rolling_mean_14":
                latest["arrival_rolling_mean_14"],

            "arrival_rolling_mean_30":
                latest["arrival_rolling_mean_30"],

            "arrival_rolling_std_7":
                latest["arrival_rolling_std_7"],

            "arrival_rolling_std_30":
                latest["arrival_rolling_std_30"]
        }
    ])


    # ---------------------------------------------------------
    # COMBINE FEATURES
    # 3 categorical + 16 numeric = 19 features
    # ---------------------------------------------------------

    X_cat = encoded_categories.astype(
        "float32"
    )

    X_num = numeric_input[
        NUMERIC_COLS
    ].astype(
        "float32"
    ).to_numpy()


    X = np.hstack([
        X_cat,
        X_num
    ])


    # ---------------------------------------------------------
    # SAFETY CHECK
    # ---------------------------------------------------------

    if X.shape[1] != model.n_features_in_:

        raise ValueError(
            f"Feature mismatch: "
            f"Model expects {model.n_features_in_}, "
            f"but prediction has {X.shape[1]}"
        )


    # ---------------------------------------------------------
    # PREDICTION
    # ---------------------------------------------------------

    pred_log = model.predict(X)[0]


    # Model trained using log1p(target)
    prediction = np.expm1(
        pred_log
    )


    # Arrival cannot be negative
    prediction = max(
        0,
        float(prediction)
    )


    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return {

        "product": product,

        "state": state,

        "district": district,

        "forecast_date":
            target_date.strftime("%Y-%m-%d"),

        "predicted_arrival_tonnes":
            round(prediction, 2),

        "latest_historical_date":
            latest_date.strftime("%Y-%m-%d"),

        "latest_actual_arrival_tonnes":
            round(
                float(
                    latest["arrivals_tonnes"]
                ),
                2
            )
    }