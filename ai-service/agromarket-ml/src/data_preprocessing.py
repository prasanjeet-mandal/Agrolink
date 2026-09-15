import pandas as pd
from pathlib import Path


# --------------------------------------------------
# 1. PROJECT PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

RAW_FILE = BASE_DIR / "datasets" / "mandi" / "mandi_dataset" / "Tomato.csv"

PROCESSED_DIR = BASE_DIR / "ml-service" / "data" / "processed"
PROCESSED_FILE = PROCESSED_DIR / "tomato_cleaned.csv"


# --------------------------------------------------
# 2. COLUMN NAMES
# --------------------------------------------------

COLUMNS = [
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
]


# --------------------------------------------------
# 3. LOAD DATA
# --------------------------------------------------

def load_data():
    print("Loading Tomato dataset...")

    df = pd.read_csv(
        RAW_FILE,
        header=None,
        names=COLUMNS
    )

    print(f"Dataset loaded successfully.")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    return df


# --------------------------------------------------
# 4. DATA CLEANING
# --------------------------------------------------

def clean_data(df):

    print("\nStarting data cleaning...")

    # Remove duplicate rows
    before = len(df)

    df = df.drop_duplicates()

    after = len(df)

    print(f"Duplicates removed: {before - after}")

    # Convert date
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    # Convert numerical columns
    numeric_columns = [
        "arrivals_tonnes",
        "min_price",
        "max_price",
        "modal_price"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Remove rows where important values are missing
    df = df.dropna(
        subset=[
            "date",
            "arrivals_tonnes",
            "modal_price"
        ]
    )

    # Remove invalid negative values
    df = df[
        (df["arrivals_tonnes"] >= 0) &
        (df["min_price"] >= 0) &
        (df["max_price"] >= 0) &
        (df["modal_price"] >= 0)
    ]

    # Sort by date
    df = df.sort_values("date")

    # Reset index
    df = df.reset_index(drop=True)

    print(f"Rows after cleaning: {len(df)}")

    return df


# --------------------------------------------------
# 5. SAVE CLEAN DATA
# --------------------------------------------------

def save_data(df):

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        PROCESSED_FILE,
        index=False
    )

    print("\nClean dataset saved:")
    print(PROCESSED_FILE)


# --------------------------------------------------
# 6. MAIN
# --------------------------------------------------

if __name__ == "__main__":

    df = load_data()

    print("\nFirst 5 rows:")
    print(df.head())

    print("\nOriginal data types:")
    print(df.dtypes)

    df = clean_data(df)

    print("\nCleaned data:")
    print(df.head())

    print("\nFinal data types:")
    print(df.dtypes)

    save_data(df)

    print("\n===================================")
    print("DATA PREPROCESSING COMPLETED")
    print("===================================")