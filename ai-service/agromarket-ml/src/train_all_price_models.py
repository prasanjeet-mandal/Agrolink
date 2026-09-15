import pandas as pd
import numpy as np
import glob
import os
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==============================
# PATHS
# ==============================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = BASE_DIR / "data" / "processed" / "commodities"
MODEL_DIR = BASE_DIR / "models" / "price"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ==============================
# SETTINGS
# ==============================

RANDOM_STATE = 42
MAX_TRAIN_ROWS = 300000

print("=" * 60)
print("MULTI-COMMODITY PRICE MODEL TRAINING")
print("=" * 60)

files = sorted(DATA_DIR.glob("*.csv"))

print(f"Feature files found: {len(files)}")

if len(files) == 0:
    print("ERROR: No feature CSV files found.")
    exit()


# ==============================
# TRAIN EACH COMMODITY
# ==============================

results = []

for index, file in enumerate(files, start=1):

    commodity = file.stem

    print("\n" + "-" * 60)
    print(f"[{index}/{len(files)}] Training: {commodity}")
    print("-" * 60)

    try:

        # --------------------------
        # Load data
        # --------------------------

        df = pd.read_csv(file)

        print(f"Rows loaded: {len(df):,}")

        if len(df) < 100:
            print("SKIPPED: Not enough rows.")
            continue

        # --------------------------
        # Required target
        # --------------------------

        target = "modal_price"

        if target not in df.columns:
            print("SKIPPED: modal_price column not found.")
            continue

        # --------------------------
        # Features
        # --------------------------

        feature_columns = [
            "year",
            "month",
            "day",
            "day_of_week",
            "week_of_year",

            "arrivals_tonnes",

            "price_lag_1",
            "price_lag_7",
            "price_lag_30",

            "arrival_lag_1",
            "arrival_lag_7",

            "price_rolling_mean_7",
            "price_rolling_mean_30",

            "arrival_rolling_mean_7",
        ]

        available_features = [
            col for col in feature_columns
            if col in df.columns
        ]

        missing_features = [
            col for col in feature_columns
            if col not in df.columns
        ]

        if missing_features:
            print("Missing features:", missing_features)

        if len(available_features) < 5:
            print("SKIPPED: Too few usable features.")
            continue

        # --------------------------
        # Clean
        # --------------------------

        df = df.dropna(
            subset=available_features + [target]
        )

        df = df.replace(
            [np.inf, -np.inf],
            np.nan
        )

        df = df.dropna(
            subset=available_features + [target]
        )

        if len(df) < 100:
            print("SKIPPED: Too few rows after cleaning.")
            continue

        # --------------------------
        # Sort by date if available
        # --------------------------

        if "date" in df.columns:
            df["date"] = pd.to_datetime(
                df["date"],
                errors="coerce"
            )

            df = df.sort_values("date")

        # --------------------------
        # Limit training size
        # --------------------------

        if len(df) > MAX_TRAIN_ROWS:

            # Keep latest rows
            df = df.tail(MAX_TRAIN_ROWS)

            print(
                f"Using latest {MAX_TRAIN_ROWS:,} rows "
                f"for memory control."
            )

        # --------------------------
        # X and y
        # --------------------------

        X = df[available_features]
        y = df[target]

        # --------------------------
        # Time based split
        # --------------------------

        split_index = int(len(df) * 0.80)

        X_train = X.iloc[:split_index]
        X_test = X.iloc[split_index:]

        y_train = y.iloc[:split_index]
        y_test = y.iloc[split_index:]

        print(f"Training rows: {len(X_train):,}")
        print(f"Testing rows : {len(X_test):,}")

        # --------------------------
        # Model
        # --------------------------

        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=20,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=-1
        )

        print("Training model...")

        model.fit(X_train, y_train)

        # --------------------------
        # Prediction
        # --------------------------

        predictions = model.predict(X_test)

        # --------------------------
        # Metrics
        # --------------------------

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

        print(f"MAE  : {mae:.2f}")
        print(f"RMSE : {rmse:.2f}")
        print(f"R2   : {r2:.4f}")

        # --------------------------
        # Save model
        # --------------------------

        model_file = (
            MODEL_DIR /
            f"{commodity}_price_model.pkl"
        )

        feature_file = (
            MODEL_DIR /
            f"{commodity}_price_features.pkl"
        )

        joblib.dump(
            model,
            model_file
        )

        joblib.dump(
            available_features,
            feature_file
        )

        print(f"Model saved: {model_file.name}")

        # --------------------------
        # Save result
        # --------------------------

        results.append({
            "commodity": commodity,
            "rows": len(df),
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "R2": round(r2, 4),
        })

        # --------------------------
        # Free memory
        # --------------------------

        del df
        del X
        del y
        del model
        del predictions

    except Exception as e:

        print(
            f"ERROR while training {commodity}:"
        )

        print(e)

        continue


# ==============================
# SAVE TRAINING RESULTS
# ==============================

if results:

    results_df = pd.DataFrame(results)

    results_file = (
        BASE_DIR /
        "data" /
        "processed" /
        "multi_price_model_results.csv"
    )

    results_df.to_csv(
        results_file,
        index=False
    )

    print("\n" + "=" * 60)
    print("PRICE MODEL TRAINING COMPLETE")
    print("=" * 60)

    print(
        f"Successful models: {len(results)}"
    )

    print(
        f"Results saved at:\n{results_file}"
    )

else:

    print("\nNo models were successfully trained.")