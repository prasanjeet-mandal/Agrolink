import pandas as pd
import os

INPUT_FILE = "data/demand/processed/arrival_daily_district_120.csv"
OUTPUT_FILE = "data/demand/processed/arrival_district_features_120.csv"

print("=" * 70)
print("120-PRODUCT DISTRICT ARRIVAL FEATURE ENGINEERING")
print("=" * 70)

print("\nLoading dataset...")

df = pd.read_csv(
    INPUT_FILE,
    parse_dates=["date"]
)

print("Rows loaded:", len(df))

# ---------------------------------------------------------
# Clean
# ---------------------------------------------------------

df["product"] = df["product"].astype(str).str.strip()
df["state"] = df["state"].astype(str).str.strip()
df["district"] = df["district"].astype(str).str.strip()

df["arrivals_tonnes"] = pd.to_numeric(
    df["arrivals_tonnes"],
    errors="coerce"
)

df = df.dropna(
    subset=[
        "date",
        "product",
        "state",
        "district",
        "arrivals_tonnes"
    ]
)

df = df[df["arrivals_tonnes"] >= 0]

# ---------------------------------------------------------
# Sort
# ---------------------------------------------------------

df = df.sort_values(
    [
        "product",
        "state",
        "district",
        "date"
    ]
).reset_index(drop=True)

print("Rows after cleaning:", len(df))

# ---------------------------------------------------------
# Calendar Features
# ---------------------------------------------------------

print("\nCreating calendar features...")

df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"] = df["date"].dt.day
df["day_of_week"] = df["date"].dt.dayofweek
df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
df["day_of_year"] = df["date"].dt.dayofyear
df["quarter"] = df["date"].dt.quarter

# ---------------------------------------------------------
# Group
# ---------------------------------------------------------

group_cols = [
    "product",
    "state",
    "district"
]

grouped = df.groupby(
    group_cols,
    group_keys=False
)

# ---------------------------------------------------------
# Lag Features
# ---------------------------------------------------------

print("Creating lag features...")

df["arrival_lag_1"] = grouped["arrivals_tonnes"].shift(1)
df["arrival_lag_7"] = grouped["arrivals_tonnes"].shift(7)
df["arrival_lag_14"] = grouped["arrivals_tonnes"].shift(14)
df["arrival_lag_30"] = grouped["arrivals_tonnes"].shift(30)

# ---------------------------------------------------------
# Rolling Features
# ---------------------------------------------------------

print("Creating rolling features...")

df["arrival_rolling_mean_7"] = (
    grouped["arrivals_tonnes"]
    .transform(
        lambda x: x.shift(1).rolling(
            7,
            min_periods=3
        ).mean()
    )
)

df["arrival_rolling_mean_14"] = (
    grouped["arrivals_tonnes"]
    .transform(
        lambda x: x.shift(1).rolling(
            14,
            min_periods=5
        ).mean()
    )
)

df["arrival_rolling_mean_30"] = (
    grouped["arrivals_tonnes"]
    .transform(
        lambda x: x.shift(1).rolling(
            30,
            min_periods=10
        ).mean()
    )
)

df["arrival_rolling_std_7"] = (
    grouped["arrivals_tonnes"]
    .transform(
        lambda x: x.shift(1).rolling(
            7,
            min_periods=3
        ).std()
    )
)

df["arrival_rolling_std_30"] = (
    grouped["arrivals_tonnes"]
    .transform(
        lambda x: x.shift(1).rolling(
            30,
            min_periods=10
        ).std()
    )
)

# ---------------------------------------------------------
# Remove rows without enough history
# ---------------------------------------------------------

feature_cols = [
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

before = len(df)

df = df.dropna(
    subset=feature_cols
).reset_index(drop=True)

after = len(df)

print("\nRows removed because of insufficient history:", before - after)

# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

print("\nSaving feature dataset...")

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

# ---------------------------------------------------------
# Summary
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 70)

print("Rows:", len(df))
print("Products:", df["product"].nunique())
print("States:", df["state"].nunique())
print("Districts:", df["district"].nunique())

print(
    "Date:",
    df["date"].min(),
    "to",
    df["date"].max()
)

print("\nColumns:")
print(df.columns.tolist())

print("\nSample:")
print(df.head(5).to_string(index=False))

print("\nSaved file:")
print(os.path.abspath(OUTPUT_FILE))

print("\nDONE!")
