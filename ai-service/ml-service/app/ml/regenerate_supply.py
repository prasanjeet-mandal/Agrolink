import pandas as pd
import numpy as np
from pathlib import Path

PATH = Path("data/processed/agrolink_roorkee_feature_engineered.csv")

print("Loading dataset...")
df = pd.read_csv(PATH)
df["date"] = pd.to_datetime(df["date"])

df = df.sort_values(["product", "market", "date"]).reset_index(drop=True)

rng = np.random.default_rng(42)

product_factor = {
    "Wheat": 1.30, "Rice": 1.35, "Maize": 1.15, "Bajra": 0.75,
    "Barley": 0.70, "Jowar": 0.65, "Ragi": 0.55, "Chickpea": 0.80,
    "Arhar": 0.70, "Masoor": 0.65, "Moong": 0.60, "Urad": 0.60,
    "Rajma": 0.50,

    "Tomato": 1.30, "Potato": 1.50, "Onion": 1.40, "Peas": 0.80,
    "Cauliflower": 0.75, "Carrot": 0.70, "Cucumber": 0.65,
    "Bottle_Gourd": 0.65, "Bitter_Gourd": 0.55, "Brinjal": 0.65,
    "Okra": 0.60, "Pumpkin": 0.55, "Green_Chilli": 0.55,

    "Apple": 0.60, "Banana": 0.90, "Mango": 0.65, "Guava": 0.55,
    "Orange": 0.65, "Papaya": 0.55, "Pomegranate": 0.50,
    "Watermelon": 0.60, "Muskmelon": 0.50,

    "Cumin": 0.45, "Coriander": 0.55, "Turmeric": 0.50,
    "Garlic": 0.70, "Ginger": 0.55, "Ajwain": 0.35,
    "Fennel": 0.35, "Fenugreek_Seed": 0.35, "Red_Chilli": 0.45,

    "Mustard_Seed": 0.65, "Groundnut": 0.65, "Soybean": 0.60,
    "Sunflower_Seed": 0.45, "Sesame": 0.40, "Linseed": 0.35,

    "Milk": 1.00, "Butter": 0.45, "Paneer": 0.40, "Ghee": 0.35
}

market_factor = {
    "Roorkee APMC": 1.30,
    "Bhagwanpur Mandi": 1.10,
    "Manglaur Mandi": 1.00,
    "Lakshar Mandi": 0.90,
    "Haridwar Union APMC": 1.15,
    "Jhabrera Collection Point": 0.70,
    "Landhaura Local Market": 0.75,
    "Piran Kaliyar Local Market": 0.65,
    "Dhandera Collection Point": 0.60,
    "Puhana Local Market": 0.65,
    "Chhutmalpur Mandi": 0.95
}

pf = df["product"].map(product_factor).fillna(0.7)
mf = df["market"].map(market_factor).fillna(1.0)

month = df["date"].dt.month

season = np.select(
    [
        month.isin([3,4,5]),
        month.isin([6,7,8]),
        month.isin([9,10]),
        month.isin([11,12,1,2])
    ],
    [1.12, 0.92, 1.05, 1.00],
    default=1.0
)

rain_effect = 1 - np.clip(df["rainfall_mm"].fillna(0) / 250, 0, 0.25)

price_effect = (
    1
    + 0.12 * (
        df["modal_price_rs_qtl"]
        / df["modal_price_rs_qtl"].groupby(df["product"]).transform("mean")
        - 1
    )
)

demand_effect = (
    1
    + 0.18 * (
        df["demand_tonnes"]
        / df["demand_tonnes"].groupby(df["product"]).transform("mean")
        - 1
    )
)

festival_effect = np.where(df["festival_flag"] == 1, 1.08, 1.0)
holiday_effect = np.where(df["holiday_flag"] == 1, 0.97, 1.0)

base = 28 * pf * mf

trend = 1 + 0.04 * np.sin(
    2 * np.pi * df["date"].dt.dayofyear / 365.25
)

noise = rng.normal(0, 0.06, len(df))

arrival = (
    base
    * season
    * rain_effect
    * price_effect
    * demand_effect
    * festival_effect
    * holiday_effect
    * trend
    * (1 + noise)
)

arrival = np.clip(arrival, 3, None)

df["arrival_tonnes"] = arrival.round(2)

g = df.groupby(["product", "market"], group_keys=False)

df["arrival_lag_1d"] = g["arrival_tonnes"].shift(1)
df["arrival_lag_8d"] = g["arrival_tonnes"].shift(2)
df["arrival_lag_28d"] = g["arrival_tonnes"].shift(7)

df["arrival_rolling_7d"] = (
    g["arrival_tonnes"]
    .transform(lambda x: x.shift(1).rolling(2).mean())
)

df["arrival_rolling_28d"] = (
    g["arrival_tonnes"]
    .transform(lambda x: x.shift(1).rolling(7).mean())
)

df["target_next_arrival"] = g["arrival_tonnes"].shift(-1)

df.to_csv(PATH, index=False)

print("\nSupply regeneration complete.")
print("Rows:", len(df))
print("Arrival mean:", round(df["arrival_tonnes"].mean(), 2))
print("Arrival std :", round(df["arrival_tonnes"].std(), 2))
print("Target mean :", round(df["target_next_arrival"].mean(), 2))
print("Target std  :", round(df["target_next_arrival"].std(), 2))
print("Target missing:", df["target_next_arrival"].isna().sum())
print("\nDataset saved successfully.")
