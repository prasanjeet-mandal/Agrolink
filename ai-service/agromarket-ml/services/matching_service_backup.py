from services.demand_service import predict_demand
from services.supply_service import find_supply
from services.distance_service import get_distance


PRODUCT_MAP = {
    "tomato": "Tomatoes",
    "tomatoes": "Tomatoes",
    "apple": "Apples",
    "apples": "Apples",
    "carrot": "Carrots",
    "carrots": "Carrots",
    "mango": "Mangoes",
    "mangoes": "Mangoes"
}


SUPPLY_PRODUCT_MAP = {
    "Tomatoes": "Tomato",
    "Apples": "Apple",
    "Carrots": "Carrot",
    "Mangoes": "Mango"
}


def normalize_product(product: str):
    key = product.strip().lower()

    if key not in PRODUCT_MAP:
        raise ValueError(
            f"Unsupported product: {product}"
        )

    return PRODUCT_MAP[key]


def find_matching_supply(
    product: str,
    state: str,
    date: str,
    min_arrival_tonnes: float = 0,
    destination: str = None
):
    demand_product = normalize_product(product)

    supply_product = SUPPLY_PRODUCT_MAP[demand_product]

    demand_result = predict_demand(
        product=demand_product,
        state=state,
        date=date
    )

    supply_result = find_supply(
        product=supply_product,
        state=state,
        min_arrival_tonnes=min_arrival_tonnes,
        target_date=date
    )

    locations = []

    for location in supply_result["locations"]:
        item = dict(location)

        if destination:
            distance_result = get_distance(
                item["district"],
                destination
            )

            item["distance_available"] = distance_result["available"]
            item["distance_km"] = distance_result["distance_km"]

        locations.append(item)

    best_source = None

    if destination:
        available_locations = [
            location
            for location in locations
            if location["distance_available"]
        ]

        if available_locations:
            best_source = min(
                available_locations,
                key=lambda x: x["distance_km"]
            )

    return {
        "product": demand_product,
        "state": state,
        "forecast_date": date,

        "predicted_demand": demand_result["predicted_demand"],
        "demand_unit": demand_result["unit"],

        "supply_unit": "tonnes",
        "supply_data_date": supply_result["latest_data_date"],

        "total_supply_locations": len(locations),

        "best_supply_source": best_source,

        "recommended_supply_locations": locations,

        "destination": destination
    }
