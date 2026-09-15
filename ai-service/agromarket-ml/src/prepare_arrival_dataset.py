import pandas as pd
import glob
import os

INPUT_DIR = "data/processed/commodities"
OUTPUT_DIR = "data/demand/processed"

os.makedirs(OUTPUT_DIR, exist_ok=True)

files = glob.glob(os.path.join(INPUT_DIR, "*_features.csv"))

print("=" * 70)
print("ARRIVAL DATASET PREPARATION")
print("=" * 70)
print("Commodity files found:", len(files))

all_data = []

for i, file in enumerate(files, 1):
    print(f"[{i}/{len(files)}] {os.path.basename(file)}")

    df = pd.read_csv(file)

    required = [
        "state",
        "district",
        "market",
        "commodity",
        "arrivals_tonnes",
        "date"
    ]

    missing = [c for c in required if c not in df.columns]

    if missing:
        print("  SKIPPED:", missing)
        continue

    df = df[required].copy()

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["arrivals_tonnes"] = pd.to_numeric(
        df["arrivals_tonnes"],
        errors="coerce"
    )

    df = df.dropna(
        subset=[
            "state",
            "district",
            "market",
            "commodity",
            "date",
            "arrivals_tonnes"
        ]
    )

    all_data.append(df)

print("\nCombining data...")

data = pd.concat(all_data, ignore_index=True)

for col in ["state", "district", "market", "commodity"]:
    data[col] = data[col].astype(str).str.strip()

data = data[data["arrivals_tonnes"] >= 0].copy()

print("Combined rows:", len(data))

print("\nCreating market-level daily data...")

market_daily = (
    data
    .groupby(
        [
            "date",
            "commodity",
            "state",
            "district",
            "market"
        ],
        as_index=False
    )["arrivals_tonnes"]
    .sum()
)

market_daily = market_daily.sort_values(
    ["commodity", "state", "district", "market", "date"]
)

market_file = os.path.join(
    OUTPUT_DIR,
    "arrival_daily_market.csv"
)

market_daily.to_csv(market_file, index=False)

print("Market rows:", len(market_daily))
print("Saved:", market_file)

print("\nCreating district-level daily data...")

district_daily = (
    market_daily
    .groupby(
        [
            "date",
            "commodity",
            "state",
            "district"
        ],
        as_index=False
    )["arrivals_tonnes"]
    .sum()
)

district_daily = district_daily.sort_values(
    ["commodity", "state", "district", "date"]
)

district_file = os.path.join(
    OUTPUT_DIR,
    "arrival_daily_district.csv"
)

district_daily.to_csv(district_file, index=False)

print("District rows:", len(district_daily))
print("Saved:", district_file)

print("\n" + "=" * 70)
print("FINAL SUMMARY")
print("=" * 70)

print("Products:", district_daily["commodity"].nunique())
print("States:", district_daily["state"].nunique())
print("Districts:", district_daily["district"].nunique())
print("Markets:", market_daily["market"].nunique())
print("Date:", district_daily["date"].min(), "to", district_daily["date"].max())

print("\nFILES CREATED:")
print(os.path.abspath(market_file))
print(os.path.abspath(district_file))

print("\nDONE!")
