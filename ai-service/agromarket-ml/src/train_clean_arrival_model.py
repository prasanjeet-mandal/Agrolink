import pandas as pd
import numpy as np
import joblib
import os
import time

from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OrdinalEncoder

INPUT_FILE = "data/demand/processed/arrival_district_clean_120.csv"
MODEL_DIR = "models/arrival_global_clean"

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 70)
print("CLEANED 120-PRODUCT DISTRICT ARRIVAL MODEL")
print("=" * 70)

start = time.time()

# ---------------------------------------------------------
# LOAD
# ---------------------------------------------------------

columns = [
    "date",
    "product",
    "state",
    "district",
    "arrivals_tonnes",
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

print("\nLoading cleaned dataset...")

df = pd.read_csv(
    INPUT_FILE,
    usecols=columns,
    parse_dates=["date"]
)

print("Rows:", len(df))

# ---------------------------------------------------------
# BASIC CLEANING
# ---------------------------------------------------------

df["arrivals_tonnes"] = pd.to_numeric(
    df["arrivals_tonnes"],
    errors="coerce"
)

df = df.dropna()

df = df[
    df["arrivals_tonnes"] >= 0
]

# ---------------------------------------------------------
# TIME SPLIT
# ---------------------------------------------------------

TRAIN_END = pd.Timestamp("2022-12-31")

train_mask = df["date"] <= TRAIN_END
test_mask = df["date"] > TRAIN_END

train_count = int(train_mask.sum())
test_count = int(test_mask.sum())

print("\nTrain rows:", train_count)
print("Test rows :", test_count)

# ---------------------------------------------------------
# SAMPLE TRAIN
# ---------------------------------------------------------

MAX_TRAIN_ROWS = 3000000

print(
    f"\nSelecting maximum {MAX_TRAIN_ROWS:,} training rows..."
)

train_indices = np.flatnonzero(
    train_mask.to_numpy()
)

rng = np.random.default_rng(42)

if len(train_indices) > MAX_TRAIN_ROWS:

    train_indices = rng.choice(
        train_indices,
        size=MAX_TRAIN_ROWS,
        replace=False
    )

train_indices.sort()

train = df.iloc[train_indices]

test = df.loc[test_mask]

print(
    "Used training rows:",
    len(train)
)

print(
    "Testing rows:",
    len(test)
)

# ---------------------------------------------------------
# FEATURES
# ---------------------------------------------------------

categorical_cols = [
    "product",
    "state",
    "district"
]

numeric_cols = [
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

# ---------------------------------------------------------
# CATEGORICAL ENCODING
# ---------------------------------------------------------

print("\nEncoding product/state/district...")

encoder = OrdinalEncoder(
    handle_unknown="use_encoded_value",
    unknown_value=-1
)

train_cat = encoder.fit_transform(
    train[categorical_cols]
)

test_cat = encoder.transform(
    test[categorical_cols]
)

# ---------------------------------------------------------
# NUMERIC FEATURES
# ---------------------------------------------------------

X_train_num = train[
    numeric_cols
].astype("float32").to_numpy()

X_test_num = test[
    numeric_cols
].astype("float32").to_numpy()

X_train = np.hstack([
    train_cat.astype("float32"),
    X_train_num
])

X_test = np.hstack([
    test_cat.astype("float32"),
    X_test_num
])

# ---------------------------------------------------------
# TARGET TRANSFORMATION
# ---------------------------------------------------------

print("\nApplying log1p target transformation...")

y_train_raw = train[
    "arrivals_tonnes"
].astype("float32").to_numpy()

y_test_raw = test[
    "arrivals_tonnes"
].astype("float32").to_numpy()

y_train = np.log1p(
    y_train_raw
)

# ---------------------------------------------------------
# MODEL
# ---------------------------------------------------------

print("\nTraining HistGradientBoosting model...")

model = HistGradientBoostingRegressor(
    max_iter=250,
    learning_rate=0.06,
    max_leaf_nodes=31,
    min_samples_leaf=80,
    l2_regularization=2.0,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

print("Training complete!")

# ---------------------------------------------------------
# PREDICTION
# ---------------------------------------------------------

print("\nGenerating predictions...")

pred_log = model.predict(
    X_test
)

pred = np.expm1(
    pred_log
)

pred = np.maximum(
    pred,
    0
)

# ---------------------------------------------------------
# METRICS
# ---------------------------------------------------------

mae = mean_absolute_error(
    y_test_raw,
    pred
)

rmse = np.sqrt(
    mean_squared_error(
        y_test_raw,
        pred
    )
)

r2 = r2_score(
    y_test_raw,
    pred
)

# Percentage error using actual values > 0
positive_mask = y_test_raw > 0

if positive_mask.sum() > 0:

    mape = np.mean(
        np.abs(
            (
                y_test_raw[positive_mask] -
                pred[positive_mask]
            )
            /
            y_test_raw[positive_mask]
        )
    ) * 100

else:
    mape = np.nan

# ---------------------------------------------------------
# PERFORMANCE
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("CLEANED MODEL PERFORMANCE")
print("=" * 70)

print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R2   : {r2:.4f}")
print(f"MAPE : {mape:.2f}%")

# ---------------------------------------------------------
# SAMPLE PREDICTIONS
# ---------------------------------------------------------

result = test[
    [
        "date",
        "product",
        "state",
        "district",
        "arrivals_tonnes"
    ]
].copy()

result["predicted_arrivals_tonnes"] = pred

print("\nSample predictions:")

print(
    result.head(20).to_string(
        index=False
    )
)

# ---------------------------------------------------------
# SAVE MODEL
# ---------------------------------------------------------

print("\nSaving model...")

joblib.dump(
    model,
    os.path.join(
        MODEL_DIR,
        "arrival_global_clean_model.pkl"
    )
)

joblib.dump(
    encoder,
    os.path.join(
        MODEL_DIR,
        "arrival_global_clean_encoder.pkl"
    )
)

joblib.dump(
    {
        "categorical_cols": categorical_cols,
        "numeric_cols": numeric_cols,
        "target": "arrivals_tonnes",
        "target_transform": "log1p",
        "train_end": str(TRAIN_END)
    },
    os.path.join(
        MODEL_DIR,
        "arrival_global_clean_metadata.pkl"
    )
)

# ---------------------------------------------------------
# SAVE TEST RESULTS
# ---------------------------------------------------------

result_file = os.path.join(
    MODEL_DIR,
    "arrival_clean_test_predictions.csv"
)

result.to_csv(
    result_file,
    index=False
)

# ---------------------------------------------------------
# FINISH
# ---------------------------------------------------------

elapsed = time.time() - start

print("\n" + "=" * 70)
print("CLEANED MODEL TRAINING COMPLETE")
print("=" * 70)

print(
    f"Time taken: {elapsed / 60:.2f} minutes"
)

print(
    "Model saved:",
    os.path.abspath(
        os.path.join(
            MODEL_DIR,
            "arrival_global_clean_model.pkl"
        )
    )
)

print(
    "Results saved:",
    os.path.abspath(
        result_file
    )
)

print("\nDONE!")
