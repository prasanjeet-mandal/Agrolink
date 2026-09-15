import pandas as pd
from pathlib import Path


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    BASE_DIR
    / "ml-service"
    / "data"
    / "processed"
    / "tomato_cleaned.csv"
)

OUTPUT_DIR = (
    BASE_DIR
    / "ml-service"
    / "data"
    / "processed"
)

OUTPUT_FILE = OUTPUT_DIR / "tomato_features.csv"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

def load_data():

    print("Loading cleaned Tomato dataset...")

    df = pd.read_csv(INPUT_FILE)

    df["date"] = pd.to_datetime(df["date"])

    print(f"Rows loaded: {len(df)}")

    return df


# --------------------------------------------------
# FEATURE ENGINEERING
# --------------------------------------------------

def create_features(df):

    print("\nCreating features...")

    # Sort properly before creating lag features
    df = df.sort_values(
        ["market", "date"]
    ).reset_index(drop=True)

    # -----------------------------
    # DATE FEATURES
    # -----------------------------

    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.dayofweek
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)

    # -----------------------------
    # PRICE FEATURES
    # -----------------------------

    # Previous market price
    df["price_lag_1"] = (
        df.groupby("market")["modal_price"]
        .shift(1)
    )

    # Price approximately one week ago
    df["price_lag_7"] = (
        df.groupby("market")["modal_price"]
        .shift(7)
    )

    # Price approximately one month ago
    df["price_lag_30"] = (
        df.groupby("market")["modal_price"]
        .shift(30)
    )

    # -----------------------------
    # ARRIVAL FEATURES
    # -----------------------------

    df["arrival_lag_1"] = (
        df.groupby("market")["arrivals_tonnes"]
        .shift(1)
    )

    df["arrival_lag_7"] = (
        df.groupby("market")["arrivals_tonnes"]
        .shift(7)
    )

    # -----------------------------
    # ROLLING PRICE FEATURES
    # -----------------------------

    df["price_rolling_mean_7"] = (
        df.groupby("market")["modal_price"]
        .transform(
            lambda x: x.shift(1).rolling(7).mean()
        )
    )

    df["price_rolling_mean_30"] = (
        df.groupby("market")["modal_price"]
        .transform(
            lambda x: x.shift(1).rolling(30).mean()
        )
    )

    # -----------------------------
    # ROLLING ARRIVAL FEATURES
    # -----------------------------

    df["arrival_rolling_mean_7"] = (
        df.groupby("market")["arrivals_tonnes"]
        .transform(
            lambda x: x.shift(1).rolling(7).mean()
        )
    )

    # -----------------------------
    # REMOVE ROWS WITH MISSING
    # -----------------------------

    feature_columns = [
        "price_lag_1",
        "price_lag_7",
        "price_lag_30",
        "arrival_lag_1",
        "arrival_lag_7",
        "price_rolling_mean_7",
        "price_rolling_mean_30",
        "arrival_rolling_mean_7"
    ]

    before = len(df)

    df = df.dropna(
        subset=feature_columns
    )

    after = len(df)

    print(
        f"Rows removed because of lag/rolling features: "
        f"{before - after}"
    )

    # Reset index
    df = df.reset_index(drop=True)

    return df


# --------------------------------------------------
# SAVE FEATURES
# --------------------------------------------------

def save_features(df):

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\nFeature dataset saved:")
    print(OUTPUT_FILE)


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":

    df = load_data()

    df = create_features(df)

    print("\nFeature dataset shape:")
    print(df.shape)

    print("\nFeature columns:")
    print(df.columns.tolist())

    print("\nSample data:")
    print(df.head())

    save_features(df)

    print("\n===================================")
    print("FEATURE ENGINEERING COMPLETED")
    print("===================================")