import pandas as pd
from pathlib import Path
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

BASE_DIR = Path(__file__).resolve().parents[1]

DTDC_FILE = BASE_DIR / "data" / "processed" / "dtdc_cleaned.csv"
DISTANCE_FILE = BASE_DIR / "data" / "processed" / "dtdc_distance_matrix.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "optimized_routes.csv"

SELECTED_DATE = "2025-06-06"
DEPOT_CITY = "Kochi"

NUMBER_OF_VEHICLES = 3
VEHICLE_CAPACITY_KG = 200

print("=" * 60)
print("AGROMARKET ROUTE OPTIMIZATION")
print("=" * 60)

# Load shipment data
print("\nLoading DTDC shipment data...")

df = pd.read_csv(DTDC_FILE)
df["Date"] = pd.to_datetime(df["Date"])

batch = df[
    (df["Date"].dt.strftime("%Y-%m-%d") == SELECTED_DATE)
    & (df["Origin"] == DEPOT_CITY)
].copy()

if batch.empty:
    raise ValueError(
        f"No shipments found for {DEPOT_CITY} on {SELECTED_DATE}"
    )

print(f"Selected Date      : {SELECTED_DATE}")
print(f"Depot              : {DEPOT_CITY}")
print(f"Total Shipments    : {len(batch)}")

# Aggregate shipments by destination
destination_data = (
    batch.groupby("Destination")
    .agg(
        Shipments=("Consignment No", "count"),
        Demand_KG=("Chargeable Wt", "sum")
    )
    .reset_index()
)

destination_data = destination_data[
    destination_data["Destination"] != DEPOT_CITY
].copy()

destination_data = destination_data.sort_values(
    "Destination"
).reset_index(drop=True)

total_demand = destination_data["Demand_KG"].sum()
total_capacity = NUMBER_OF_VEHICLES * VEHICLE_CAPACITY_KG

print(f"Unique Destinations: {len(destination_data)}")
print(f"Total Demand       : {total_demand:.2f} kg")

# Capacity check
print("\nVehicle Configuration")
print("-" * 40)
print(f"Vehicles            : {NUMBER_OF_VEHICLES}")
print(f"Capacity / Vehicle  : {VEHICLE_CAPACITY_KG} kg")
print(f"Total Capacity      : {total_capacity} kg")
print(f"Total Demand        : {total_demand:.2f} kg")

if total_demand > total_capacity:
    raise ValueError(
        "Total shipment weight exceeds total vehicle capacity."
    )

# Load distance matrix
print("\nLoading distance matrix...")

distance_df = pd.read_csv(
    DISTANCE_FILE,
    index_col=0
)

locations = [
    DEPOT_CITY
] + destination_data["Destination"].tolist()

missing_cities = [
    city for city in locations
    if city not in distance_df.index
]

if missing_cities:
    raise ValueError(
        f"Missing cities in distance matrix: {missing_cities}"
    )

print(f"Total Routing Nodes : {len(locations)}")

# Create distance matrix
routing_distance_matrix = []

for from_city in locations:
    row = []

    for to_city in locations:
        distance = distance_df.loc[from_city, to_city]

        # Convert km to integer cost
        row.append(int(round(distance * 100)))

    routing_distance_matrix.append(row)

# Create demands
demands = [0]

for city in locations[1:]:
    weight = destination_data.loc[
        destination_data["Destination"] == city,
        "Demand_KG"
    ].iloc[0]

    demands.append(int(round(weight * 100)))

vehicle_capacities = [
    int(VEHICLE_CAPACITY_KG * 100)
] * NUMBER_OF_VEHICLES

# Create OR-Tools model
print("\nCreating OR-Tools model...")

manager = pywrapcp.RoutingIndexManager(
    len(locations),
    NUMBER_OF_VEHICLES,
    0
)

routing = pywrapcp.RoutingModel(manager)

# Distance callback
def distance_callback(from_index, to_index):
    from_node = manager.IndexToNode(from_index)
    to_node = manager.IndexToNode(to_index)

    return routing_distance_matrix[from_node][to_node]

transit_callback_index = routing.RegisterTransitCallback(
    distance_callback
)

routing.SetArcCostEvaluatorOfAllVehicles(
    transit_callback_index
)

# Demand callback
def demand_callback(from_index):
    from_node = manager.IndexToNode(from_index)

    return demands[from_node]

demand_callback_index = routing.RegisterUnaryTransitCallback(
    demand_callback
)

# Capacity constraint
routing.AddDimensionWithVehicleCapacity(
    demand_callback_index,
    0,
    vehicle_capacities,
    True,
    "Capacity"
)

# Search parameters
search_parameters = pywrapcp.DefaultRoutingSearchParameters()

search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
)

search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)

search_parameters.time_limit.seconds = 10

# Solve
print("\nOptimizing routes...")

solution = routing.SolveWithParameters(
    search_parameters
)

if solution is None:
    raise RuntimeError(
        "No feasible route solution found."
    )

# Display routes
print("\n")
print("=" * 60)
print("OPTIMIZED ROUTES")
print("=" * 60)

results = []

total_distance_km = 0
total_load_kg = 0

for vehicle_id in range(NUMBER_OF_VEHICLES):

    index = routing.Start(vehicle_id)

    route = []
    route_distance = 0
    route_load = 0

    while not routing.IsEnd(index):

        node = manager.IndexToNode(index)
        city = locations[node]

        route.append(city)

        route_load += demands[node] / 100

        next_index = solution.Value(
            routing.NextVar(index)
        )

        route_distance += routing.GetArcCostForVehicle(
            index,
            next_index,
            vehicle_id
        )

        index = next_index

    # Add final depot
    final_node = manager.IndexToNode(index)
    route.append(locations[final_node])

    route_distance_km = route_distance / 100

    total_distance_km += route_distance_km
    total_load_kg += route_load

    utilization = (
        route_load / VEHICLE_CAPACITY_KG
    ) * 100

    print(f"\nVehicle {vehicle_id + 1}")
    print("-" * 40)

    print("Route:")
    print(" -> ".join(route))

    print(f"Load        : {route_load:.2f} kg")
    print(f"Capacity    : {VEHICLE_CAPACITY_KG:.2f} kg")
    print(f"Utilization : {utilization:.2f}%")
    print(f"Distance    : {route_distance_km:.2f} km")

    for stop_order, city in enumerate(route, start=1):
        results.append({
            "Vehicle": vehicle_id + 1,
            "Stop_Order": stop_order,
            "City": city,
            "Route_Load_KG": round(route_load, 2),
            "Route_Distance_KM": round(
                route_distance_km,
                2
            )
        })

# Save output
results_df = pd.DataFrame(results)

results_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n")
print("=" * 60)
print("ROUTE OPTIMIZATION COMPLETE")
print("=" * 60)

print(f"Total Distance : {total_distance_km:.2f} km")
print(f"Total Load     : {total_load_kg:.2f} kg")
print(f"Vehicles Used  : {NUMBER_OF_VEHICLES}")
print(f"Output File    : {OUTPUT_FILE}")

print("=" * 60)
