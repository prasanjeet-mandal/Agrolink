import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / ".."
    / "datasets"
    / "logistics"
    / "Dataset_Generator_for_DTDC.csv"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "dtdc_cleaned.csv"

print("Loading DTDC dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Original rows: {len(df)}")

required_columns = [
    "Origin",
    "Destination",
    "Sender Pincode",
    "Receiver Pincode",
    "Total Pieces",
    "Actual Wt",
    "Volumetric Wt",
    "Chargeable Wt",
    "Date",
    "Mode",
    "Consignment No"
]

df = df[required_columns].copy()

before = len(df)

df = df.drop_duplicates(
    subset=["Consignment No"]
)

print(f"Duplicate shipments removed: {before - len(df)}")

df["Date"] = pd.to_datetime(
    df["Date"],
    errors="coerce"
)

numeric_columns = [
    "Sender Pincode",
    "Receiver Pincode",
    "Total Pieces",
    "Actual Wt",
    "Volumetric Wt",
    "Chargeable Wt"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

df = df.dropna(
    subset=[
        "Origin",
        "Destination",
        "Sender Pincode",
        "Receiver Pincode",
        "Total Pieces",
        "Chargeable Wt",
        "Date"
    ]
)

df = df[
    (df["Total Pieces"] > 0) &
    (df["Chargeable Wt"] > 0)
]

df = df.sort_values(
    "Date"
).reset_index(drop=True)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n================================")
print("DTDC PREPROCESSING COMPLETE")
print("================================")

print(f"Final rows: {len(df)}")
print(f"Final columns: {len(df.columns)}")

print("\nModes:")
print(df["Mode"].value_counts())

print("\nSaved file:")
print(OUTPUT_FILE)

print("\nFirst 5 rows:")
print(df.head().to_string())
