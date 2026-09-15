import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "demand",
    "processed",
    "arrival_daily_district_120.csv"
)

_data = None


def load_data():
    global _data

    if _data is None:
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(
                f"Supply data not found: {DATA_PATH}"
            )

        _data = pd.read_csv(DATA_PATH)

        _data.columns = [
            "date",
            "product",
            "state",
            "district",
            "arrivals_tonnes"
        ]

        _data["date"] = pd.to_datetime(
            _data["date"],
            errors="coerce"
        )

        _data["arrivals_tonnes"] = pd.to_numeric(
            _data["arrivals_tonnes"],
            errors="coerce"
        )

        _data = _data.dropna(
            subset=["date", "arrivals_tonnes"]
        )

    return _data


def find_supply(
    product: str,
    state: str,
    min_arrival_tonnes: float = 0,
    target_date: str = None
):
    data = load_data()

    product = product.strip()
    state = state.strip()

    result = data[
        (data["product"].str.lower() == product.lower()) &
        (data["state"].str.lower() == state.lower())
    ].copy()

    if result.empty:
        raise ValueError(
            f"No supply data found for {product} / {state}"
        )

    if target_date is not None:
        target_date = pd.to_datetime(
            target_date,
            errors="coerce"
        )

        if pd.isna(target_date):
            raise ValueError("Invalid target date")

        result = result[
            result["date"] <= target_date
        ].copy()

        if result.empty:
            raise ValueError(
                f"No supply data available on or before {target_date.strftime('%Y-%m-%d')}"
            )

    latest_data_date = result["date"].max()
    cutoff_date = latest_data_date - pd.Timedelta(days=90)

    result = result[
        result["date"] >= cutoff_date
    ].copy()

    if result.empty:
        raise ValueError(
            f"No recent supply data found for {product} / {state}"
        )

    # Latest available record for each district
    latest = (
        result.sort_values("date")
        .groupby("district", as_index=False)
        .tail(1)
        .copy()
    )

    # Apply minimum supply filter AFTER selecting latest record
    latest = latest[
        latest["arrivals_tonnes"] >= min_arrival_tonnes
    ].copy()

    if latest.empty:
        raise ValueError(
            f"No supply locations found with at least "
            f"{min_arrival_tonnes} tonnes"
        )

    latest = latest.sort_values(
        "arrivals_tonnes",
        ascending=False
    )

    locations = []

    for _, row in latest.iterrows():
        locations.append({
            "district": row["district"],
            "latest_date": row["date"].strftime("%Y-%m-%d"),
            "arrival_tonnes": round(
                float(row["arrivals_tonnes"]),
                2
            )
        })

    return {
        "product": product,
        "state": state,
        "latest_data_date": latest_data_date.strftime("%Y-%m-%d"),
        "cutoff_date": cutoff_date.strftime("%Y-%m-%d"),
        "minimum_arrival_tonnes": min_arrival_tonnes,
        "total_supply_locations": len(locations),
        "locations": locations
    }
