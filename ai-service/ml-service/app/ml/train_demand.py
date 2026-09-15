import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = BASE_DIR / "data" / "processed" / "agrolink_roorkee_feature_engineered.csv"
MODEL_DIR = BASE_DIR / "app" / "models" / "demand"
MODEL_FILE = MODEL_DIR / "demand_model.joblib"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_FILE)
df["date"] = pd.to_datetime(df["date"])

features = [
    "market",
    "category",
    "product",
    "modal_price_rs_qtl",
    "arrival_tonnes",
    "demand_tonnes",
    "demand_index",
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
    "price_range_rs_qtl",
    "supply_demand_ratio",
    "net_price_after_transport",
    "price_lag_1d",
    "price_lag_8d",
    "price_lag_28d",
    "arrival_lag_1d",
    "arrival_lag_8d",
    "arrival_lag_28d",
    "demand_lag_1d",
    "demand_lag_8d",
    "demand_lag_28d",
    "price_rolling_7d",
    "price_rolling_28d",
    "arrival_rolling_7d",
    "arrival_rolling_28d",
    "demand_rolling_7d",
    "demand_rolling_28d",
    "month",
    "day_of_week",
    "week_of_year",
    "year",
    "sin_doy",
    "cos_doy"
]

target = "target_next_demand"

df = df.dropna(subset=features + [target]).copy()

train = df[df["date"] < "2026-01-01"]
validation = df[
    (df["date"] >= "2026-01-01") &
    (df["date"] < "2026-07-01")
]
test = df[df["date"] >= "2026-07-01"]

print("Train:", train.shape)
print("Validation:", validation.shape)
print("Test:", test.shape)

X_train = train[features]
y_train = train[target]

X_val = validation[features]
y_val = validation[target]

X_test = test[features]
y_test = test[target]

categorical = [
    "market",
    "category",
    "product"
]

numeric = [c for c in features if c not in categorical]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical
        ),
        (
            "num",
            "passthrough",
            numeric
        )
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

print("Training Demand Random Forest...")

pipeline.fit(X_train, y_train)

def evaluate(name, X, y):
    pred = pipeline.predict(X)

    mae = mean_absolute_error(y, pred)
    rmse = np.sqrt(mean_squared_error(y, pred))
    r2 = r2_score(y, pred)

    print(f"\n{name}")
    print(f"MAE : {mae:.2f} tonnes")
    print(f"RMSE: {rmse:.2f} tonnes")
    print(f"R2  : {r2:.4f}")

evaluate("VALIDATION", X_val, y_val)
evaluate("TEST", X_test, y_test)

joblib.dump(pipeline, MODEL_FILE)

print("\nModel saved:")
print(MODEL_FILE)
