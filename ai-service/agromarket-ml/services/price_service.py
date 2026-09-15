from pathlib import Path
import pandas as pd
import joblib


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = BASE_DIR / "models" / "price"

FEATURE_DIR = (
    BASE_DIR
    / "data"
    / "processed"
    / "commodities"
)


# =========================================================
# PREDICT PRICE
# =========================================================

def predict_price(
    commodity: str,
    market: str,
    date: str
):

    commodity = commodity.strip()

    # -----------------------------------------------------
    # Files
    # -----------------------------------------------------

    model_file = (
        MODEL_DIR
        / f"{commodity}_features_price_model.pkl"
    )

    feature_file = (
        MODEL_DIR
        / f"{commodity}_features_price_features.pkl"
    )

    historical_file = (
        FEATURE_DIR
        / f"{commodity}_features.csv"
    )

    # -----------------------------------------------------
    # Check files
    # -----------------------------------------------------

    if not model_file.exists():

        raise FileNotFoundError(
            f"Price model not found for commodity: {commodity}"
        )

    if not feature_file.exists():

        raise FileNotFoundError(
            f"Feature definition not found for commodity: {commodity}"
        )

    if not historical_file.exists():

        raise FileNotFoundError(
            f"Historical feature data not found for commodity: {commodity}"
        )

    # -----------------------------------------------------
    # Load model
    # -----------------------------------------------------

    model = joblib.load(model_file)

    feature_columns = joblib.load(feature_file)

    df = pd.read_csv(historical_file)

    # -----------------------------------------------------
    # Date
    # -----------------------------------------------------

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    requested_date = pd.to_datetime(
        date,
        errors="coerce"
    )

    if pd.isna(requested_date):

        raise ValueError(
            "Invalid date format. Use YYYY-MM-DD."
        )

    # -----------------------------------------------------
    # Filter market
    # -----------------------------------------------------

    market_df = df[
        df["market"]
        .astype(str)
        .str.strip()
        .str.lower()
        ==
        market.strip().lower()
    ].copy()

    if market_df.empty:

        available_markets = (
            df["market"]
            .dropna()
            .astype(str)
            .drop_duplicates()
            .head(20)
            .tolist()
        )

        raise ValueError(
            f"Market '{market}' not found for {commodity}. "
            f"Example markets: {available_markets}"
        )

    # -----------------------------------------------------
    # Sort by date
    # -----------------------------------------------------

    market_df = market_df.sort_values("date")

    # -----------------------------------------------------
    # Historical row
    # -----------------------------------------------------

    previous_rows = market_df[
        market_df["date"] <= requested_date
    ]

    if previous_rows.empty:

        raise ValueError(
            f"No historical data available for "
            f"{commodity} in market {market} "
            f"before {date}."
        )

    latest_row = previous_rows.iloc[-1]

    # -----------------------------------------------------
    # Input features
    # -----------------------------------------------------

    input_data = {}

    input_data["year"] = requested_date.year

    input_data["month"] = requested_date.month

    input_data["day"] = requested_date.day

    input_data["day_of_week"] = requested_date.dayofweek

    input_data["week_of_year"] = int(
        requested_date.isocalendar().week
    )

    # -----------------------------------------------------
    # Historical features
    # -----------------------------------------------------

    historical_features = [

        "arrivals_tonnes",

        "price_lag_1",

        "price_lag_7",

        "price_lag_30",

        "arrival_lag_1",

        "arrival_lag_7",

        "price_rolling_mean_7",

        "price_rolling_mean_30",

        "arrival_rolling_mean_7"
    ]

    for feature in historical_features:

        if feature not in market_df.columns:

            raise ValueError(
                f"Feature '{feature}' missing "
                f"from {commodity} feature data."
            )

        input_data[feature] = latest_row[feature]

    # -----------------------------------------------------
    # DataFrame
    # -----------------------------------------------------

    X = pd.DataFrame([input_data])

    X = X[feature_columns]

    # -----------------------------------------------------
    # Prediction
    # -----------------------------------------------------

    prediction = model.predict(X)[0]

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {

        "commodity": commodity,

        "market": market,

        "date": date,

        "predicted_modal_price": round(
            float(prediction),
            2
        ),

        "currency": "INR",

        "unit": "per quintal"
    }


# =========================================================
# COMPARE MARKET PRICES
# =========================================================

def compare_market_prices(
    commodity: str,
    date: str,
    top_n: int = 5
):

    commodity = commodity.strip()

    historical_file = (
        FEATURE_DIR
        / f"{commodity}_features.csv"
    )

    if not historical_file.exists():

        raise FileNotFoundError(
            f"Historical feature data not found "
            f"for commodity: {commodity}"
        )

    df = pd.read_csv(historical_file)

    markets = (
        df["market"]
        .dropna()
        .astype(str)
        .str.strip()
        .drop_duplicates()
        .tolist()
    )

    if not markets:

        raise ValueError(
            f"No markets found for {commodity}"
        )

    results = []

    for market in markets:

        try:

            prediction = predict_price(
                commodity=commodity,
                market=market,
                date=date
            )

            results.append({

                "market": market,

                "predicted_modal_price":
                    prediction[
                        "predicted_modal_price"
                    ]
            })

        except Exception:

            continue

    if not results:

        raise ValueError(
            f"Could not predict price "
            f"for any market of {commodity}"
        )

    # -----------------------------------------------------
    # Sort cheapest first
    # -----------------------------------------------------

    results = sorted(
        results,
        key=lambda x:
            x["predicted_modal_price"]
    )

    cheapest = results[0]

    top_markets = results[:top_n]

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {

        "commodity": commodity,

        "date": date,

        "cheapest_market":
            cheapest["market"],

        "cheapest_price":
            cheapest["predicted_modal_price"],

        "top_cheapest_markets":
            top_markets,

        "total_markets_compared":
            len(results),

        "currency": "INR",

        "unit": "per quintal"
    }