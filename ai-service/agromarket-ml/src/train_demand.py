import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "tomato_features.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "models"
    / "demand"
)

MODEL_FILE = MODEL_DIR / "tomato_arrival_model.pkl"
FEATURE_FILE = MODEL_DIR / "tomato_arrival_features.pkl"


MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

print("===================================")
print("TOMATO ARRIVAL FORECASTING")
print("===================================")

print("\nLoading feature dataset...")

df = pd.read_csv(DATA_FILE)

print(f"Dataset rows: {len(df)}")


# ============================================================
# DATE
# ============================================================

df["date"] = pd.to_datetime(df["date"], errors="coerce")

df = df.dropna(subset=["date"])


# ============================================================
# TARGET CLEANING
# ============================================================

print("\nCleaning target...")

# Target = mandi arrivals
target = "arrivals_tonnes"

df[target] = pd.to_numeric(
    df[target],
    errors="coerce"
)

df = df.dropna(subset=[target])

# Negative arrivals are invalid
df = df[df[target] >= 0]

print(f"Rows after target cleaning: {len(df)}")


# ============================================================
# FEATURES
# ============================================================

features = [
    "year",
    "month",
    "day",
    "day_of_week",
    "week_of_year",

    "price_lag_1",
    "price_lag_7",
    "price_lag_30",

    "arrival_lag_1",
    "arrival_lag_7",

    "price_rolling_mean_7",
    "price_rolling_mean_30",

    "arrival_rolling_mean_7"
]


# Keep only features available in dataset
features = [
    feature
    for feature in features
    if feature in df.columns
]

print("\nFeatures used:")

for feature in features:
    print("-", feature)


# ============================================================
# REMOVE MISSING VALUES
# ============================================================

df = df.dropna(
    subset=features + [target]
)

print(f"\nRows after removing missing values: {len(df)}")


# ============================================================
# TIME BASED SORT
# ============================================================

print("\nSorting data by date...")

df = df.sort_values("date").reset_index(drop=True)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

print("\nCreating time-based train/test split...")

split_index = int(len(df) * 0.80)

train_df = df.iloc[:split_index]
test_df = df.iloc[split_index:]


X_train = train_df[features]
y_train = train_df[target]

X_test = test_df[features]
y_test = test_df[target]


print(f"Training rows: {len(X_train)}")
print(f"Testing rows: {len(X_test)}")


# ============================================================
# LIMIT TRAINING SIZE
# ============================================================

# Dataset bahut large hai, isliye training ko manageable
# rakhne ke liye maximum 500,000 rows use karenge.

MAX_TRAIN_ROWS = 500_000

if len(X_train) > MAX_TRAIN_ROWS:

    print(
        f"\nLarge dataset detected."
        f"\nUsing {MAX_TRAIN_ROWS} rows for training..."
    )

    # Time order maintain karte hue latest training rows use karo
    X_train = X_train.iloc[-MAX_TRAIN_ROWS:]
    y_train = y_train.iloc[-MAX_TRAIN_ROWS:]


# ============================================================
# MODEL
# ============================================================

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


# ============================================================
# PREDICTION
# ============================================================

print("\nMaking predictions...")

predictions = model.predict(X_test)


# ============================================================
# EVALUATION
# ============================================================

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


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({
    "feature": features,
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


# ============================================================
# SAVE MODEL
# ============================================================

print("\nSaving model...")

joblib.dump(
    model,
    MODEL_FILE
)

joblib.dump(
    features,
    FEATURE_FILE
)


# ============================================================
# SUCCESS
# ============================================================

print("\n===================================")
print("MODEL SAVED SUCCESSFULLY")
print("===================================")

print(f"Model: {MODEL_FILE}")
print(f"Features: {FEATURE_FILE}")

print("\n===================================")
print("ARRIVAL FORECASTING COMPLETED")
print("===================================")