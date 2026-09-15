import pandas as pd
import requests
import json
from pathlib import Path


# ============================================
# PATHS
# ============================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = BASE_DIR / "data" / "processed" / "dtdc_cleaned.csv"

API_URL = "http://127.0.0.1:8000/predict/route/map"


# ============================================
# SETTINGS
# ============================================

# Historical DTDC data se ek batch select karenge
SELECTED_DATE = "2025-06-06"
DEPOT = "Kochi"

# Maximum vehicles available
VEHICLES = 3

# Prototype vehicle capacity
VEHICLE_CAPACITY_KG = 200


# ============================================
# LOAD DATA
# ============================================

print("=" * 60)
print("DTDC → AGROMARKET ROUTE TEST")
print("=" * 60)

print("\nLoading DTDC cleaned dataset...")

df = pd.read_csv(DATA_FILE)

print(f"Total dataset rows: {len(df)}")


# ============================================
# FILTER DATE + DEPOT
# ============================================

df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

selected_date = pd.to_datetime(SELECTED_DATE)

batch = df[
    (df["Date"].dt.date == selected_date.date()) &
    (df["Origin"].str.strip().str.lower() == DEPOT.lower())
].copy()


print(f"\nSelected date : {SELECTED_DATE}")
print(f"Depot         : {DEPOT}")
print(f"Shipments     : {len(batch)}")


# ============================================
# CHECK DATA
# ============================================

if batch.empty:
    raise ValueError(
        f"No DTDC shipments found for {DEPOT} on {SELECTED_DATE}"
    )


# Remove shipments whose destination is same as depot
batch = batch[
    batch["Destination"].str.strip().str.lower() != DEPOT.lower()
].copy()


# ============================================
# CREATE AGROMARKET ORDERS
# ============================================

orders = []

for index, row in batch.iterrows():

    destination = str(row["Destination"]).strip()

    weight = float(row["Chargeable Wt"])

    if weight <= 0:
        continue

    orders.append({
        "order_id": f"DTDC-{row['Consignment No']}",
        "destination": destination,
        "weight_kg": round(weight, 2)
    })


print(f"Valid orders: {len(orders)}")


# ============================================
# SUMMARY
# ============================================

total_weight = sum(order["weight_kg"] for order in orders)

unique_destinations = len(
    set(order["destination"] for order in orders)
)

print(f"Total load           : {total_weight:.2f} kg")
print(f"Unique destinations  : {unique_destinations}")
print(f"Vehicle capacity     : {VEHICLE_CAPACITY_KG} kg")
print(f"Available vehicles   : {VEHICLES}")


# ============================================
# CAPACITY CHECK
# ============================================

total_capacity = VEHICLES * VEHICLE_CAPACITY_KG

print(f"Total vehicle capacity: {total_capacity} kg")

if total_weight > total_capacity:
    print("\nWARNING:")
    print("Total shipment weight is greater than available capacity.")
    print("Increase vehicles or vehicle capacity.")
else:
    print("\nCapacity check: PASSED")


# ============================================
# CREATE API REQUEST
# ============================================

payload = {
    "depot": DEPOT,
    "vehicles": VEHICLES,
    "vehicle_capacity_kg": VEHICLE_CAPACITY_KG,
    "orders": orders
}


# ============================================
# SAVE REQUEST JSON
# ============================================

OUTPUT_FILE = BASE_DIR / "data" / "processed" / "dtdc_route_request.json"

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(payload, file, indent=2)


print("\nRequest JSON saved:")
print(OUTPUT_FILE)


# ============================================
# SEND TO FASTAPI
# ============================================

print("\nSending DTDC orders to FastAPI...")

try:

    response = requests.post(
        API_URL,
        json=payload,
        timeout=60
    )

    print(f"HTTP Status: {response.status_code}")

    response.raise_for_status()

    result = response.json()

except requests.exceptions.ConnectionError:

    raise RuntimeError(
        "\nFastAPI server is not running.\n"
        "Start it using:\n"
        "uvicorn api.main:app"
    )


# ============================================
# DISPLAY RESULT
# ============================================

print("\n" + "=" * 60)
print("ROUTE OPTIMIZATION RESULT")
print("=" * 60)

print(json.dumps(result, indent=2))


# ============================================
# FINAL SUMMARY
# ============================================

if result.get("status") == "success":

    print("\n" + "=" * 60)
    print("SUCCESS")
    print("=" * 60)

    print(
        f"Vehicles used    : "
        f"{result['route_result']['vehicles_used']}"
    )

    print(
        f"Total orders     : "
        f"{result['route_result']['total_orders']}"
    )

    print(
        f"Total load       : "
        f"{result['route_result']['total_load_kg']} kg"
    )

    print(
        f"Total distance   : "
        f"{result['route_result']['total_distance_km']} km"
    )

    print(
        f"\nInteractive map:\n"
        f"{result['map_file']}"
    )

else:

    print("\nRoute optimization failed.")

print("\nDone.")