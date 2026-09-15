import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.metrics import mean_absolute_error, r2_score

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = BASE_DIR / "data" / "processed" / "agrolink_roorkee_feature_engineered.csv"
MODEL_FILE = BASE_DIR / "app" / "models" / "price" / "price_model.joblib"

df = pd.read_csv(DATA_FILE)
df["date"] = pd.to_datetime(df["date"])

features = [
    "market","category","product",
    "min_price_rs_qtl","max_price_rs_qtl",
    "arrival_tonnes","demand_tonnes","demand_index",
    "temperature_c","humidity_pct","rainfall_mm",
    "distance_from_roorkee_km","road_quality_score",
    "travel_time_hr","transport_cost_rs","cold_chain_available",
    "quality_score","moisture_pct","festival_flag","holiday_flag",
    "price_range_rs_qtl","supply_demand_ratio",
    "net_price_after_transport","price_lag_1d","price_lag_8d",
    "price_lag_28d","price_rolling_7d","price_rolling_28d",
    "month","day_of_week","week_of_year","year","sin_doy","cos_doy"
]

target = "target_next_price"

df = df.dropna(subset=features + [target])

test = df[df["date"] >= "2026-07-01"].copy()

model = joblib.load(MODEL_FILE)

test["prediction"] = model.predict(test[features])
test["error"] = abs(test[target] - test["prediction"])

result = (
    test.groupby(["category", "product"])
    .agg(
        samples=(target, "size"),
        actual_mean=(target, "mean"),
        predicted_mean=("prediction", "mean"),
        MAE=("error", "mean")
    )
    .reset_index()
    .sort_values("MAE", ascending=False)
)

print("\nPRODUCT-WISE TEST ERROR")
print(result.to_string(index=False))

print("\nOVERALL")
print("MAE:", mean_absolute_error(test[target], test["prediction"]))
print("R2 :", r2_score(test[target], test["prediction"]))

output = BASE_DIR / "data" / "processed" / "price_error_analysis.csv"
result.to_csv(output, index=False)

print("\nSaved:", output)
