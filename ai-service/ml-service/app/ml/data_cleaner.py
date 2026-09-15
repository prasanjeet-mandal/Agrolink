import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

RAW_FILE = BASE_DIR / "data" / "raw" / "agrolink_roorkee_raw_clean.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "cleaned_data.csv"

print("Loading raw dataset...")
df = pd.read_csv(RAW_FILE)

print("Initial shape:", df.shape)

# Date
df["date"] = pd.to_datetime(df["date"], errors="coerce")

# Remove empty rows and duplicates
df = df.dropna(how="all")
df = df.drop_duplicates()

# Numeric price conversion
price_cols = [
    "min_price_rs_qtl",
    "max_price_rs_qtl",
    "modal_price_rs_qtl"
]

for col in price_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Remove invalid price rows
df = df.dropna(subset=price_cols)

df = df[
    (df["min_price_rs_qtl"] >= 0) &
    (df["max_price_rs_qtl"] >= 0) &
    (df["modal_price_rs_qtl"] >= 0) &
    (df["min_price_rs_qtl"] <= df["max_price_rs_qtl"]) &
    (df["modal_price_rs_qtl"] >= df["min_price_rs_qtl"]) &
    (df["modal_price_rs_qtl"] <= df["max_price_rs_qtl"])
]

# Numeric columns
numeric_cols = [
    "arrival_tonnes",
    "demand_tonnes",
    "demand_index",
    "temperature_c",
    "humidity_pct",
    "rainfall_mm",
    "distance_from_roorkee_km",
    "road_quality_score",
    "travel_time_hr",
    "transport_cost_rs",
    "quality_score",
    "moisture_pct"
]

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# Critical fields
critical_cols = [
    "date",
    "market",
    "category",
    "product"
]

df = df.dropna(subset=critical_cols)

# Sort for time-series processing
df = df.sort_values(
    ["product", "market", "date"]
).reset_index(drop=True)

# Save
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(OUTPUT_FILE, index=False)

print("Final shape:", df.shape)
print("Missing values:", df.isna().sum().sum())
print("Duplicates:", df.duplicated().sum())
print("Saved:", OUTPUT_FILE)
