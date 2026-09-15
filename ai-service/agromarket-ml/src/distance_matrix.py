import pandas as pd
import numpy as np
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / ".."
    / "datasets"
    / "locations"
    / "city_coordinates.csv"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "dtdc_distance_matrix.csv"


# --------------------------------------------------
# HAVERSINE DISTANCE
# --------------------------------------------------

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in KM

    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat1)
        * np.cos(lat2)
        * np.sin(dlon / 2) ** 2
    )

    c = 2 * np.arcsin(np.sqrt(a))

    return R * c


# --------------------------------------------------
# LOAD CITY COORDINATES
# --------------------------------------------------

print("Loading city coordinates...")

df = pd.read_csv(INPUT_FILE)

cities = df["city"].tolist()

print(f"Total cities: {len(cities)}")


# --------------------------------------------------
# CREATE DISTANCE MATRIX
# --------------------------------------------------

distance_matrix = []

for i, city1 in enumerate(cities):

    row = []

    for j, city2 in enumerate(cities):

        distance = haversine(
            df.iloc[i]["latitude"],
            df.iloc[i]["longitude"],
            df.iloc[j]["latitude"],
            df.iloc[j]["longitude"]
        )

        row.append(round(float(distance), 2))

    distance_matrix.append(row)


# --------------------------------------------------
# SAVE MATRIX
# --------------------------------------------------

matrix_df = pd.DataFrame(
    distance_matrix,
    index=cities,
    columns=cities
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

matrix_df.to_csv(OUTPUT_FILE)


# --------------------------------------------------
# OUTPUT
# --------------------------------------------------

print("\n================================")
print("DISTANCE MATRIX COMPLETE")
print("================================")

print(f"Matrix size: {len(cities)} x {len(cities)}")

print("\nSample distance matrix:")

print(matrix_df.iloc[:5, :5])

print("\nExample distances:")

if "Delhi" in matrix_df.index and "Mumbai" in matrix_df.columns:
    print(
        f"Delhi -> Mumbai: "
        f"{matrix_df.loc['Delhi', 'Mumbai']} km"
    )

if "Delhi" in matrix_df.index and "Agra" in matrix_df.columns:
    print(
        f"Delhi -> Agra: "
        f"{matrix_df.loc['Delhi', 'Agra']} km"
    )

print("\nSaved:")
print(OUTPUT_FILE)
