import pandas as pd
import joblib

from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

DATA_PATH = Path("data/processed/agrolink_roorkee_feature_engineered.csv")
MODEL_PATH = Path("app/models/supply/supply_model.joblib")

MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)
df["date"] = pd.to_datetime(df["date"])

target = "target_next_arrival"

features = [
    "market", "category", "product",
    "arrival_tonnes",
    "demand_tonnes",
    "demand_index",
    "modal_price_rs_qtl",
    "min_price_rs_qtl",
    "max_price_rs_qtl",
    "price_range_rs_qtl",
    "supply_demand_ratio",
    "temperature_c",
    "humidity_pct",
    "rainfall_mm",
    "distance_from_roorkee_km",
    "road_quality_score",
    "travel_time_hr",
    "transport_cost_rs",
    "cold_chain_available",
    "quality_score",
    "moisture_pct",
    "festival_flag",
    "holiday_flag",
    "arrival_lag_1d",
    "arrival_lag_8d",
    "arrival_lag_28d",
    "arrival_rolling_7d",
    "arrival_rolling_28d",
    "demand_lag_1d",
    "demand_lag_8d",
    "demand_lag_28d",
    "demand_rolling_7d",
    "demand_rolling_28d",
    "price_lag_1d",
    "price_lag_8d",
    "price_lag_28d",
    "price_rolling_7d",
    "price_rolling_28d",
    "month",
    "day_of_week",
    "week_of_year",
    "year",
    "sin_doy",
    "cos_doy"
]

df = df.dropna(subset=features + [target]).copy()

train = df[df["date"] < "2026-01-01"]
val = df[(df["date"] >= "2026-01-01") & (df["date"] < "2026-07-01")]
test = df[df["date"] >= "2026-07-01"]

print(f"Train: {train.shape}")
print(f"Validation: {val.shape}")
print(f"Test: {test.shape}")

X_train = train[features]
y_train = train[target]

X_val = val[features]
y_val = val[target]

X_test = test[features]
y_test = test[target]

categorical = ["market", "category", "product"]
numeric = [c for c in features if c not in categorical]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", "passthrough", numeric)
    ]
)

model = RandomForestRegressor(
    n_estimators=150,
    max_depth=18,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])

print("Training Supply/Arrival Random Forest...")

pipeline.fit(X_train, y_train)

def evaluate(name, X, y):
    pred = pipeline.predict(X)

    mae = mean_absolute_error(y, pred)
    rmse = mean_squared_error(y, pred) ** 0.5
    r2 = r2_score(y, pred)

    print(f"\n{name}")
    print(f"MAE : {mae:.2f} tonnes")
    print(f"RMSE: {rmse:.2f} tonnes")
    print(f"R2  : {r2:.4f}")

evaluate("VALIDATION", X_val, y_val)
evaluate("TEST", X_test, y_test)

joblib.dump(pipeline, MODEL_PATH)

print(f"\nModel saved: {MODEL_PATH}")
