import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

ROUTE_FILE = BASE_DIR / "data" / "processed" / "optimized_routes.csv"
COORD_FILE = BASE_DIR.parent / "datasets" / "locations" / "city_coordinates.csv"

OUTPUT_DIR = BASE_DIR / "plots" / "route"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "optimized_routes_map.png"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("Loading optimized routes...")
routes = pd.read_csv(ROUTE_FILE)

print("Loading city coordinates...")
coords = pd.read_csv(COORD_FILE)

print(f"Routes rows: {len(routes)}")
print(f"Cities: {len(coords)}")


# --------------------------------------------------
# CHECK REQUIRED COLUMNS
# --------------------------------------------------

required_route_columns = [
    "Vehicle",
    "Stop_Order",
    "City"
]

required_coord_columns = [
    "city",
    "latitude",
    "longitude"
]

for column in required_route_columns:
    if column not in routes.columns:
        raise ValueError(f"Missing route column: {column}")

for column in required_coord_columns:
    if column not in coords.columns:
        raise ValueError(f"Missing coordinate column: {column}")


# --------------------------------------------------
# MERGE ROUTE + COORDINATES
# --------------------------------------------------

routes = routes.merge(
    coords,
    left_on="City",
    right_on="city",
    how="left"
)

# Check missing coordinates
missing = routes[
    routes["latitude"].isna() |
    routes["longitude"].isna()
]

if not missing.empty:
    print("WARNING: Missing coordinates:")
    print(missing["City"].unique())


# --------------------------------------------------
# CREATE MAP
# --------------------------------------------------

plt.figure(figsize=(14, 10))

vehicles = sorted(routes["Vehicle"].unique())

for vehicle in vehicles:

    vehicle_data = routes[
        routes["Vehicle"] == vehicle
    ].sort_values("Stop_Order")

    # Plot route line
    plt.plot(
        vehicle_data["longitude"],
        vehicle_data["latitude"],
        marker="o",
        linewidth=2,
        label=f"Vehicle {vehicle}"
    )

    # Add city names
    for _, row in vehicle_data.iterrows():

        plt.annotate(
            row["City"],
            (
                row["longitude"],
                row["latitude"]
            ),
            xytext=(5, 5),
            textcoords="offset points",
            fontsize=8
        )


# --------------------------------------------------
# HIGHLIGHT DEPOT
# --------------------------------------------------

depot = routes[
    routes["Stop_Order"] == routes["Stop_Order"].min()
].iloc[0]

plt.scatter(
    depot["longitude"],
    depot["latitude"],
    marker="*",
    s=250,
    label=f"Depot: {depot['City']}"
)


# --------------------------------------------------
# MAP DETAILS
# --------------------------------------------------

plt.title(
    "AgroMarket - Optimized Delivery Routes",
    fontsize=16
)

plt.xlabel("Longitude")
plt.ylabel("Latitude")

plt.legend()
plt.grid(True)

plt.tight_layout()


# --------------------------------------------------
# SAVE
# --------------------------------------------------

plt.savefig(
    OUTPUT_FILE,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print()
print("===================================")
print("ROUTE VISUALIZATION COMPLETE")
print("===================================")
print(f"Saved at:")
print(OUTPUT_FILE)