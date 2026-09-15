from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parents[1]
DATASET_DIR = BASE_DIR.parent / "datasets" / "mandi" / "mandi_selected"
MODEL_DIR = BASE_DIR / "models" / "arrival"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 50000
MAX_ROWS = 100000

print("=" * 70)
print("FAST MULTI-COMMODITY ARRIVAL MODEL TRAINING")
print("=" * 70)

files = sorted(DATASET_DIR.glob("*.csv"))
results = []

for index, file_path in enumerate(files, start=1):

    commodity = file_path.stem
    model_file = MODEL_DIR / f"{commodity}_arrival_model.pkl"
    feature_file = MODEL_DIR / f"{commodity}_arrival_features.pkl"

    if model_file.exists() and feature_file.exists():
        print(f"[{index}/{len(files)}] SKIP: {commodity} (already trained)")
        continue

    print("\n" + "-" * 70)
    print(f"[{index}/{len(files)}] Training: {commodity}")
    print("-" * 70)

    try:
        chunks = []

        for chunk in pd.read_csv(
            file_path,
            header=None,
            names=[
                "state",
                "district",
                "market",
                "commodity",
                "group",
                "arrivals_tonnes",
                "min_price",
                "max_price",
                "modal_price",
                "date"
            ],
            usecols=[2, 5, 8, 9],
            chunksize=CHUNK_SIZE
        ):

            chunk.columns = [
                "market",
                "arrivals_tonnes",
                "modal_price",
                "date"
            ]

            chunk["date"] = pd.to_datetime(
                chunk["date"],
                errors="coerce",
                format="mixed"
            )

            chunk["arrivals_tonnes"] = pd.to_numeric(
                chunk["arrivals_tonnes"],
                errors="coerce"
            )

            chunk["modal_price"] = pd.to_numeric(
                chunk["modal_price"],
                errors="coerce"
            )

            chunk = chunk.dropna(
                subset=["market", "date", "arrivals_tonnes", "modal_price"]
            )

            chunk = chunk[
                (chunk["arrivals_tonnes"] >= 0) &
                (chunk["modal_price"] >= 0)
            ]

            if not chunk.empty:
                chunks.append(chunk)

        if not chunks:
            print("SKIPPED: No valid data")
            continue

        df = pd.concat(chunks, ignore_index=True)
        del chunks

        print(f"Rows loaded: {len(df):,}")

        df = df.sort_values(["market", "date"])

        df["year"] = df["date"].dt.year
        df["month"] = df["date"].dt.month
        df["day"] = df["date"].dt.day
        df["day_of_week"] = df["date"].dt.dayofweek
        df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)

        grouped = df.groupby("market", group_keys=False)

        df["arrival_lag_1"] = grouped["arrivals_tonnes"].shift(1)
        df["arrival_lag_7"] = grouped["arrivals_tonnes"].shift(7)
        df["arrival_lag_30"] = grouped["arrivals_tonnes"].shift(30)

        df["arrival_rolling_mean_7"] = grouped[
            "arrivals_tonnes"
        ].transform(
            lambda x: x.shift(1).rolling(7).mean()
        )

        df["arrival_rolling_mean_30"] = grouped[
            "arrivals_tonnes"
        ].transform(
            lambda x: x.shift(1).rolling(30).mean()
        )

        df["price_lag_1"] = grouped["modal_price"].shift(1)
        df["price_lag_7"] = grouped["modal_price"].shift(7)

        df["price_rolling_mean_7"] = grouped[
            "modal_price"
        ].transform(
            lambda x: x.shift(1).rolling(7).mean()
        )

        features = [
            "year",
            "month",
            "day",
            "day_of_week",
            "week_of_year",
            "price_lag_1",
            "price_lag_7",
            "price_rolling_mean_7",
            "arrival_lag_1",
            "arrival_lag_7",
            "arrival_lag_30",
            "arrival_rolling_mean_7",
            "arrival_rolling_mean_30"
        ]

        df = df.dropna(
            subset=features + ["arrivals_tonnes"]
        )

        if len(df) < 1000:
            print("SKIPPED: Too few rows")
            del df
            continue

        if len(df) > MAX_ROWS:
            df = df.tail(MAX_ROWS)

        X = df[features]
        y = df["arrivals_tonnes"]

        split = int(len(df) * 0.80)

        X_train = X.iloc[:split]
        X_test = X.iloc[split:]
        y_train = y.iloc[:split]
        y_test = y.iloc[split:]

        print(f"Training rows: {len(X_train):,}")
        print(f"Testing rows : {len(X_test):,}")

        model = RandomForestRegressor(
            n_estimators=40,
            max_depth=15,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )

        print("Training...")

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        r2 = r2_score(y_test, predictions)

        print(f"MAE : {mae:.2f}")
        print(f"RMSE: {rmse:.2f}")
        print(f"R2  : {r2:.4f}")

        joblib.dump(model, model_file)
        joblib.dump(features, feature_file)

        print(f"Saved: {model_file.name}")

        results.append({
            "commodity": commodity,
            "rows": len(df),
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "R2": round(r2, 4)
        })

        del df, X, y, X_train, X_test
        del y_train, y_test, model, predictions

    except Exception as e:
        print(f"ERROR: {commodity}")
        print(e)

if results:
    results_file = (
        BASE_DIR /
        "data" /
        "processed" /
        "multi_arrival_model_results.csv"
    )

    pd.DataFrame(results).to_csv(
        results_file,
        index=False
    )

print("\n" + "=" * 70)
print("FAST ARRIVAL TRAINING FINISHED")
print("=" * 70)
