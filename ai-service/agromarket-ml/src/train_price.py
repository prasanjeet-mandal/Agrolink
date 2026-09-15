import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    BASE_DIR
    / "ml-service"
    / "data"
    / "processed"
    / "tomato_features.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "ml-service"
    / "models"
    / "price"
)

MODEL_FILE = MODEL_DIR / "tomato_price_model.pkl"


# ==================================================
# LOAD DATA
# ==================================================

print("Loading feature dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Dataset rows: {len(df)}")


# ==================================================
# CLEAN TARGET
# ==================================================

print("\nCleaning target...")

# Modal price 0 means invalid/unusable price
df = df[df["modal_price"] > 0].copy()

print(f"Rows after removing zero prices: {len(df)}")


# ==================================================
# SORT BY DATE
# ==================================================

df = df.sort_values("date").reset_index(drop=True)


# ==================================================
# SELECT FEATURES
# ==================================================

FEATURES = [
    "year",
    "month",
    "day",
    "day_of_week",
    "week_of_year",

    "arrivals_tonnes",

    "min_price",
    "max_price",

    "price_lag_1",
    "price_lag_7",
    "price_lag_30",

    "arrival_lag_1",
    "arrival_lag_7",

    "price_rolling_mean_7",
    "price_rolling_mean_30",

    "arrival_rolling_mean_7"
]

TARGET = "modal_price"


X = df[FEATURES]
y = df[TARGET]


# ==================================================
# TIME-BASED TRAIN TEST SPLIT
# ==================================================

print("\nCreating time-based train/test split...")

split_index = int(len(df) * 0.80)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]

print(f"Training rows: {len(X_train)}")
print(f"Testing rows: {len(X_test)}")


# ==================================================
# MODEL
# ==================================================

print("\nTraining Random Forest model...")

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=20,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("Model training completed.")


# ==================================================
# PREDICTION
# ==================================================

print("\nMaking predictions...")

predictions = model.predict(X_test)


# ==================================================
# EVALUATION
# ==================================================

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)

r2 = r2_score(
    y_test,
    predictions
)


print("\n===================================")
print("MODEL EVALUATION")
print("===================================")

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R2   : {r2:.4f}")


# ==================================================
# FEATURE IMPORTANCE
# ==================================================

importance = pd.DataFrame({
    "feature": FEATURES,
    "importance": model.feature_importances_
})

importance = importance.sort_values(
    "importance",
    ascending=False
)

print("\nFeature Importance:")

print(
    importance.to_string(
        index=False
    )
)


# ==================================================
# SAVE MODEL
# ==================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    model,
    MODEL_FILE
)

# Save feature list too
FEATURE_FILE = MODEL_DIR / "tomato_price_features.pkl"

joblib.dump(
    FEATURES,
    FEATURE_FILE
)


print("\n===================================")
print("MODEL SAVED SUCCESSFULLY")
print("===================================")

print(f"Model: {MODEL_FILE}")
print(f"Features: {FEATURE_FILE}")