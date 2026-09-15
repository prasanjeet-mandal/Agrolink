import pandas as pd
import numpy as np
import joblib
import os
import time

from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OrdinalEncoder

INPUT_FILE = "data/demand/processed/arrival_district_features_120.csv"
MODEL_DIR = "models/arrival_global"

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 70)
print("CORRECTED 120-PRODUCT DISTRICT ARRIVAL MODEL")
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

print("\nLoading data...")

df = pd.read_csv(
    INPUT_FILE,
    usecols=columns,
    parse_dates=["date"]
)

print("Rows:", len(df))

# ---------------------------------------------------------
# CLEAN
# ---------------------------------------------------------

df = df.dropna()

df["arrivals_tonnes"] = pd.to_numeric(
    df["arrivals_tonnes"],
    errors="coerce"
)

df = df[df["arrivals_tonnes"] >= 0]

df = df.sort_values("date")

# ---------------------------------------------------------
# TIME SPLIT
# ---------------------------------------------------------

TRAIN_END = pd.Timestamp("2022-12-31")

train_mask = df["date"] <= TRAIN_END
test_mask = df["date"] > TRAIN_END

print("\nTrain rows:", int(train_mask.sum()))
print("Test rows :", int(test_mask.sum()))

# ---------------------------------------------------------
# SAMPLE TRAIN DATA
# ---------------------------------------------------------

MAX_TRAIN_ROWS = 3000000

train_idx = np.flatnonzero(
    train_mask.to_numpy()
)

rng = np.random.default_rng(42)

if len(train_idx) > MAX_TRAIN_ROWS:
    train_idx = rng.choice(
        train_idx,
        MAX_TRAIN_ROWS,
        replace=False
    )

train_idx.sort()

train = df.iloc[train_idx]
test = df.loc[test_mask]

print("Used training rows:", len(train))
print("Testing rows:", len(test))

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

print("\nEncoding categories...")

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
# NUMERIC
# ---------------------------------------------------------

X_train_num = train[numeric_cols].astype(
    "float32"
).to_numpy()

X_test_num = test[numeric_cols].astype(
    "float32"
).to_numpy()

X_train = np.hstack([
    train_cat.astype("float32"),
    X_train_num
])

X_test = np.hstack([
    test_cat.astype("float32"),
    X_test_num
])

# ---------------------------------------------------------
# LOG TARGET
# ---------------------------------------------------------

print("\nApplying log transformation to target...")

y_train_raw = train["arrivals_tonnes"].astype(
    "float32"
).to_numpy()

y_test_raw = test["arrivals_tonnes"].astype(
    "float32"
).to_numpy()

y_train = np.log1p(
    y_train_raw
)

# ---------------------------------------------------------
# MODEL
# ---------------------------------------------------------

print("\nTraining model...")

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

print("\nPredicting...")

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
# LIMIT EXTREME PREDICTIONS
# ---------------------------------------------------------

# Prevent obviously impossible extreme values.
# Upper limit is based on training target distribution.

upper_limit = np.percentile(
    y_train_raw,
    99.9
)

pred = np.minimum(
    pred,
    upper_limit * 3
)

print(
    "Prediction upper limit:",
    upper_limit * 3
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

print("\n" + "=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)

print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R2   : {r2:.4f}")

# ---------------------------------------------------------
# RESULTS
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
# SAVE
# ---------------------------------------------------------

print("\nSaving model...")

joblib.dump(
    model,
    os.path.join(
        MODEL_DIR,
        "arrival_global_model.pkl"
    )
)

joblib.dump(
    encoder,
    os.path.join(
        MODEL_DIR,
        "arrival_encoder.pkl"
    )
)

joblib.dump(
    {
        "categorical_cols": categorical_cols,
        "numeric_cols": numeric_cols,
        "target": "arrivals_tonnes",
        "target_transform": "log1p",
        "upper_limit": float(upper_limit * 3),
        "train_end": str(TRAIN_END)
    },
    os.path.join(
        MODEL_DIR,
        "arrival_metadata.pkl"
    )
)

result_file = os.path.join(
    MODEL_DIR,
    "arrival_test_predictions.csv"
)

result.to_csv(
    result_file,
    index=False
)

elapsed = time.time() - start

print("\n" + "=" * 70)
print("CORRECTED MODEL COMPLETE")
print("=" * 70)

print(
    f"Time taken: {elapsed / 60:.2f} minutes"
)

print(
    "Model:",
    os.path.abspath(
        os.path.join(
            MODEL_DIR,
            "arrival_global_model.pkl"
        )
    )
)

print(
    "Results:",
    os.path.abspath(
        result_file
    )
)

print("\nDONE!")
