import pandas as pd
import glob
import os

INPUT_DIR = "data/processed/commodities"
OUTPUT_DIR = "data/demand/processed"

os.makedirs(OUTPUT_DIR, exist_ok=True)

files = glob.glob(os.path.join(INPUT_DIR, "*_features.csv"))

print("=" * 70)
print("CORRECT 120-PRODUCT ARRIVAL DATASET")
print("=" * 70)

all_data = []

for i, file in enumerate(files, 1):

    product = os.path.basename(file).replace(
        "_features.csv", ""
    )

    print(f"[{i}/{len(files)}] {product}")

    df = pd.read_csv(
        file,
        usecols=[
            "state",
            "district",
            "market",
            "arrivals_tonnes",
            "date"
        ]
    )

    df["product"] = product

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["arrivals_tonnes"] = pd.to_numeric(
        df["arrivals_tonnes"],
        errors="coerce"
    )

    df = df.dropna(
        subset=[
            "state",
            "district",
            "market",
            "date",
            "arrivals_tonnes"
        ]
    )

    df = df[
        df["arrivals_tonnes"] >= 0
    ]

    all_data.append(df)

print("\nCombining...")

data = pd.concat(
    all_data,
    ignore_index=True
)

for col in [
    "product",
    "state",
    "district",
    "market"
]:
    data[col] = (
        data[col]
        .astype(str)
        .str.strip()
    )

print("Raw combined rows:", len(data))

# --------------------------------------------------
# MARKET LEVEL
# --------------------------------------------------

print("\nCreating market-level data...")

market_daily = (
    data
    .groupby(
        [
            "date",
            "product",
            "state",
            "district",
            "market"
        ],
        as_index=False
    )["arrivals_tonnes"]
    .sum()
)

market_daily = market_daily.sort_values(
    [
        "product",
        "state",
        "district",
        "market",
        "date"
    ]
)

market_file = os.path.join(
    OUTPUT_DIR,
    "arrival_daily_market_120.csv"
)

market_daily.to_csv(
    market_file,
    index=False
)

# --------------------------------------------------
# DISTRICT LEVEL
# --------------------------------------------------

print("Creating district-level data...")

district_daily = (
    market_daily
    .groupby(
        [
            "date",
            "product",
            "state",
            "district"
        ],
        as_index=False
    )["arrivals_tonnes"]
    .sum()
)

district_daily = district_daily.sort_values(
    [
        "product",
        "state",
        "district",
        "date"
    ]
)

district_file = os.path.join(
    OUTPUT_DIR,
    "arrival_daily_district_120.csv"
)

district_daily.to_csv(
    district_file,
    index=False
)

# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

print("\n" + "=" * 70)
print("FINAL SUMMARY")
print("=" * 70)

print("Products:", district_daily["product"].nunique())
print("States:", district_daily["state"].nunique())
print("Districts:", district_daily["district"].nunique())
print("Markets:", market_daily["market"].nunique())

print(
    "Date:",
    district_daily["date"].min(),
    "to",
    district_daily["date"].max()
)

print(
    "Market rows:",
    len(market_daily)
)

print(
    "District rows:",
    len(district_daily)
)

print("\nProducts:")
print(
    sorted(
        district_daily["product"]
        .unique()
    )
)

print("\nFILES CREATED:")
print(os.path.abspath(market_file))
print(os.path.abspath(district_file))

print("\nDONE!")
