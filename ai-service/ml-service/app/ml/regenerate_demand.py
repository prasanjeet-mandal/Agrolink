import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

FILE = BASE_DIR / "data" / "processed" / "agrolink_roorkee_feature_engineered.csv"

print("Loading dataset...")
df = pd.read_csv(FILE)
df["date"] = pd.to_datetime(df["date"])

rng = np.random.default_rng(42)

# Sort first
df = df.sort_values(["product", "market", "date"]).reset_index(drop=True)

# ---------------------------------------------------------
# 1. Product demand factors
# ---------------------------------------------------------
product_factor = {
    "Wheat": 1.25, "Rice": 1.30, "Maize": 1.05,
    "Potato": 1.30, "Onion": 1.20, "Tomato": 1.15,
    "Milk": 1.45, "Paneer": 0.95, "Butter": 0.80,
    "Ghee": 0.75, "Apple": 0.85, "Banana": 1.15,
    "Orange": 0.90, "Mango": 1.05, "Watermelon": 1.10,
    "Pomegranate": 0.70, "Papaya": 0.80, "Guava": 0.85,
    "Chickpea": 1.00, "Arhar": 0.95, "Moong": 0.85,
    "Masoor": 0.90, "Urad": 0.85, "Rajma": 0.75,
    "Bajra": 0.70, "Jowar": 0.65, "Barley": 0.60,
    "Ragi": 0.60, "Groundnut": 0.85, "Mustard_Seed": 0.80,
    "Soybean": 0.75, "Sunflower_Seed": 0.65, "Sesame": 0.60,
    "Linseed": 0.55, "Cumin": 0.55, "Coriander": 0.75,
    "Turmeric": 0.80, "Garlic": 0.90, "Ginger": 0.80,
    "Red_Chilli": 0.75, "Ajwain": 0.55, "Fennel": 0.55,
    "Fenugreek_Seed": 0.50,
    "Bitter_Gourd": 0.70, "Bottle_Gourd": 0.75,
    "Brinjal": 0.80, "Carrot": 0.75, "Cauliflower": 0.85,
    "Cucumber": 0.75, "Green_Chilli": 0.90,
    "Okra": 0.75, "Peas": 0.80, "Pumpkin": 0.60
}

# ---------------------------------------------------------
# 2. Market factors
# ---------------------------------------------------------
market_factor = {
    "Roorkee APMC": 1.15,
    "Bhagwanpur Mandi": 1.10,
    "Manglaur Mandi": 1.05,
    "Lakshar Mandi": 0.95,
    "Haridwar Union APMC": 1.12,
    "Chhutmalpur Mandi": 1.00,
    "Jhabrera Collection Point": 0.82,
    "Dhandera Collection Point": 0.88,
    "Landhaura Local Market": 0.90,
    "Piran Kaliyar Local Market": 0.85,
    "Puhana Local Market": 0.92
}

# ---------------------------------------------------------
# 3. Base demand
# ---------------------------------------------------------
df["product_factor"] = df["product"].map(product_factor).fillna(1.0)
df["market_factor"] = df["market"].map(market_factor).fillna(1.0)

# Seasonality
doy = df["date"].dt.dayofyear

seasonality = (
    1.0
    + 0.18 * np.sin(2 * np.pi * doy / 365.25)
    + 0.08 * np.cos(4 * np.pi * doy / 365.25)
)

# Weather effect
temperature_effect = (
    1.0
    + np.clip((df["temperature_c"] - 25) / 100, -0.10, 0.10)
)

rainfall_effect = (
    1.0
    - np.clip(df["rainfall_mm"] / 500, 0, 0.08)
)

# Festival / holiday demand boost
festival_effect = np.where(
    df["festival_flag"].astype(float) > 0,
    1.12,
    1.0
)

holiday_effect = np.where(
    df["holiday_flag"].astype(float) > 0,
    1.05,
    1.0
)

# Price effect:
# Higher price slightly reduces demand.
price_mean = df["modal_price_rs_qtl"].median()
price_effect = (
    1.0
    - 0.08 * (
        (df["modal_price_rs_qtl"] / price_mean) - 1
    )
)

price_effect = price_effect.clip(0.85, 1.15)

# Supply/arrival effect
arrival_median = df["arrival_tonnes"].median()

arrival_effect = (
    1.0
    + 0.10 * (
        (df["arrival_tonnes"] / arrival_median) - 1
    )
)

arrival_effect = arrival_effect.clip(0.85, 1.15)

# ---------------------------------------------------------
# 4. Generate realistic demand
# ---------------------------------------------------------
base = (
    32
    * df["product_factor"]
    * df["market_factor"]
    * seasonality
    * temperature_effect
    * rainfall_effect
    * festival_effect
    * holiday_effect
    * price_effect
    * arrival_effect
)

noise = rng.normal(0, 2.5, len(df))

df["demand_tonnes"] = (base + noise).clip(2, 180)

# Demand index
df["demand_index"] = (
    100
    * df["demand_tonnes"]
    / df["demand_tonnes"].median()
).clip(10, 250)

# ---------------------------------------------------------
# 5. Recalculate demand lag features
# ---------------------------------------------------------
group = df.groupby(["product", "market"], sort=False)

df["demand_lag_1d"] = group["demand_tonnes"].shift(1)
df["demand_lag_8d"] = group["demand_tonnes"].shift(2)
df["demand_lag_28d"] = group["demand_tonnes"].shift(7)

df["demand_rolling_7d"] = group["demand_tonnes"].transform(
    lambda x: x.shift(1).rolling(2, min_periods=2).mean()
)

df["demand_rolling_28d"] = group["demand_tonnes"].transform(
    lambda x: x.shift(1).rolling(7, min_periods=7).mean()
)

# ---------------------------------------------------------
# 6. Future demand target
# ---------------------------------------------------------
df["target_next_demand"] = group["demand_tonnes"].shift(-1)

# ---------------------------------------------------------
# 7. Remove helper columns
# ---------------------------------------------------------
df = df.drop(
    columns=["product_factor", "market_factor"],
    errors="ignore"
)

df.to_csv(FILE, index=False)

print("\nDemand regeneration complete.")
print("Shape:", df.shape)
print("Demand mean:", round(df["demand_tonnes"].mean(), 2))
print("Demand std:", round(df["demand_tonnes"].std(), 2))
print("Target mean:", round(df["target_next_demand"].mean(), 2))
print("Target std:", round(df["target_next_demand"].std(), 2))
print("Target missing:", df["target_next_demand"].isna().sum())
print("Demand lag/rolling missing:", df[
    [
        "demand_lag_1d",
        "demand_lag_8d",
        "demand_lag_28d",
        "demand_rolling_7d",
        "demand_rolling_28d"
    ]
].isna().sum().sum())

print("\nSaved:", FILE)
