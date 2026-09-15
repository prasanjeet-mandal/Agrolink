from src.dynamic_route_map import create_route_map
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from pathlib import Path
import pandas as pd
from ortools.constraint_solver import pywrapcp, routing_enums_pb2


router = APIRouter(
    prefix="/predict",
    tags=["Route Optimization"]
)


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

DISTANCE_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "dtdc_distance_matrix.csv"
)


# =========================================================
# LOAD DISTANCE MATRIX
# =========================================================

try:

    distance_df = pd.read_csv(
        DISTANCE_FILE,
        index_col=0
    )

    print("Distance matrix loaded successfully.")

except Exception as e:

    distance_df = None

    print(f"Distance matrix loading error: {e}")


# =========================================================
# REQUEST MODELS
# =========================================================

class Order(BaseModel):

    order_id: str

    destination: str

    weight_kg: float


class RouteRequest(BaseModel):

    depot: str

    vehicles: int

    vehicle_capacity_kg: float

    orders: List[Order]


# =========================================================
# ROUTE OPTIMIZATION
# =========================================================

@router.post("/route")
def optimize_route(request: RouteRequest):

    # -----------------------------------------------------
    # CHECK DISTANCE MATRIX
    # -----------------------------------------------------

    if distance_df is None:

        raise HTTPException(
            status_code=500,
            detail="Distance matrix is not loaded."
        )


    # -----------------------------------------------------
    # BASIC VALIDATION
    # -----------------------------------------------------

    if request.vehicles <= 0:

        raise HTTPException(
            status_code=400,
            detail="Number of vehicles must be greater than 0."
        )


    if request.vehicle_capacity_kg <= 0:

        raise HTTPException(
            status_code=400,
            detail="Vehicle capacity must be greater than 0."
        )


    if len(request.orders) == 0:

        raise HTTPException(
            status_code=400,
            detail="At least one order is required."
        )


    # -----------------------------------------------------
    # CHECK DEPOT
    # -----------------------------------------------------

    if request.depot not in distance_df.index:

        raise HTTPException(
            status_code=400,
            detail=f"Depot '{request.depot}' not found."
        )


    # -----------------------------------------------------
    # VALIDATE ORDERS
    # -----------------------------------------------------

    for order in request.orders:

        if order.destination not in distance_df.index:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Destination '{order.destination}' "
                    f"not found in distance matrix."
                )
            )

        if order.weight_kg <= 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Weight for order "
                    f"'{order.order_id}' must be greater than 0."
                )
            )


    # -----------------------------------------------------
    # REMOVE ORDERS WHOSE DESTINATION IS DEPOT
    # -----------------------------------------------------

    orders = [
        order
        for order in request.orders
        if order.destination != request.depot
    ]


    if len(orders) == 0:

        return {
            "status": "success",
            "message": "All orders are already at the depot.",
            "depot": request.depot,
            "vehicles_used": 0,
            "total_distance_km": 0,
            "total_load_kg": 0,
            "vehicles": []
        }


    # -----------------------------------------------------
    # CITY DEMANDS
    # -----------------------------------------------------

    city_demands = {}

    city_orders = {}


    for order in orders:

        city = order.destination

        if city not in city_demands:

            city_demands[city] = 0

            city_orders[city] = []


        city_demands[city] += order.weight_kg

        city_orders[city].append(order.order_id)


    # -----------------------------------------------------
    # CAPACITY CHECK
    # -----------------------------------------------------

    total_demand = sum(
        city_demands.values()
    )

    total_capacity = (
        request.vehicles
        * request.vehicle_capacity_kg
    )


    if total_demand > total_capacity:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Total demand is {round(total_demand, 2)} kg "
                f"but vehicle capacity is only "
                f"{round(total_capacity, 2)} kg."
            )
        )


    # -----------------------------------------------------
    # CREATE CITY LIST
    # -----------------------------------------------------

    cities = [request.depot] + list(
        city_demands.keys()
    )


    city_to_index = {
        city: i
        for i, city in enumerate(cities)
    }


    # -----------------------------------------------------
    # DISTANCE MATRIX
    # -----------------------------------------------------

    matrix = []

    for from_city in cities:

        row = []

        for to_city in cities:

            distance = float(
                distance_df.loc[
                    from_city,
                    to_city
                ]
            )

            # OR-Tools requires integer cost
            row.append(
                int(round(distance * 100))
            )

        matrix.append(row)


    # -----------------------------------------------------
    # DEMANDS
    # -----------------------------------------------------

    demands = [0]

    for city in cities[1:]:

        # Convert kg to integer grams
        demand = int(
            round(
                city_demands[city] * 1000
            )
        )

        demands.append(demand)


    capacity = int(
        round(
            request.vehicle_capacity_kg * 1000
        )
    )


    # -----------------------------------------------------
    # OR-TOOLS
    # -----------------------------------------------------

    manager = pywrapcp.RoutingIndexManager(
        len(matrix),
        request.vehicles,
        city_to_index[request.depot]
    )


    routing = pywrapcp.RoutingModel(
        manager
    )


    # -----------------------------------------------------
    # DISTANCE CALLBACK
    # -----------------------------------------------------

    def distance_callback(
        from_index,
        to_index
    ):

        from_node = manager.IndexToNode(
            from_index
        )

        to_node = manager.IndexToNode(
            to_index
        )

        return matrix[
            from_node
        ][
            to_node
        ]


    transit_callback_index = (
        routing.RegisterTransitCallback(
            distance_callback
        )
    )


    routing.SetArcCostEvaluatorOfAllVehicles(
        transit_callback_index
    )


    # -----------------------------------------------------
    # DEMAND CALLBACK
    # -----------------------------------------------------

    def demand_callback(
        from_index
    ):

        from_node = manager.IndexToNode(
            from_index
        )

        return demands[from_node]


    demand_callback_index = (
        routing.RegisterUnaryTransitCallback(
            demand_callback
        )
    )


    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,
        [capacity] * request.vehicles,
        True,
        "Capacity"
    )


    # -----------------------------------------------------
    # SEARCH SETTINGS
    # -----------------------------------------------------

    search_parameters = (
        pywrapcp.DefaultRoutingSearchParameters()
    )


    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy
        .PATH_CHEAPEST_ARC
    )


    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic
        .GUIDED_LOCAL_SEARCH
    )


    search_parameters.time_limit.seconds = 5


    # -----------------------------------------------------
    # SOLVE
    # -----------------------------------------------------

    solution = routing.SolveWithParameters(
        search_parameters
    )


    if solution is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "No feasible route found. "
                "Try increasing vehicle capacity "
                "or number of vehicles."
            )
        )


    # =====================================================
    # BUILD RESPONSE
    # =====================================================

    vehicles_result = []

    total_distance = 0

    total_load = 0


    for vehicle_id in range(
        request.vehicles
    ):

        index = routing.Start(
            vehicle_id
        )

        route = []

        route_distance = 0

        route_load = 0


        while not routing.IsEnd(index):

            node_index = manager.IndexToNode(
                index
            )

            city = cities[node_index]

            route.append(city)

            route_load += demands[node_index] / 1000


            next_index = solution.Value(
                routing.NextVar(index)
            )


            route_distance += (
                routing.GetArcCostForVehicle(
                    index,
                    next_index,
                    vehicle_id
                ) / 100
            )


            index = next_index


        # Add final depot
        final_node = manager.IndexToNode(
            index
        )

        route.append(
            cities[final_node]
        )


        # Only include vehicles actually used
        if len(route) > 2:

            total_distance += route_distance

            total_load += route_load


            destination_details = []


            for city in route:

                if city == request.depot:

                    continue


                destination_details.append({

                    "city": city,

                    "orders": city_orders.get(
                        city,
                        []
                    ),

                    "weight_kg": round(
                        city_demands.get(
                            city,
                            0
                        ),
                        2
                    )

                })


            utilization = (
                route_load
                / request.vehicle_capacity_kg
            ) * 100


            vehicles_result.append({

                "vehicle": vehicle_id + 1,

                "route": route,

                "load_kg": round(
                    route_load,
                    2
                ),

                "capacity_kg": round(
                    request.vehicle_capacity_kg,
                    2
                ),

                "utilization_percent": round(
                    utilization,
                    2
                ),

                "distance_km": round(
                    route_distance,
                    2
                ),

                "destinations": destination_details

            })


    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "status": "success",

        "depot": request.depot,

        "vehicles_used": len(
            vehicles_result
        ),

        "total_orders": len(
            orders
        ),

        "total_load_kg": round(
            total_load,
            2
        ),

        "total_distance_km": round(
            total_distance,
            2
        ),

        "vehicles": vehicles_result

    }
@router.post("/route/map")
def optimize_route_with_map(request: RouteRequest):

    # Run existing route optimization
    result = optimize_route(request)

    # Create map
    map_file = create_route_map(
        result,
        filename="dynamic_route_map.html"
    )

    return {
        "status": result["status"],
        "message": "Route optimized and map generated successfully.",
        "route_result": result,
        "map_file": map_file
    }
