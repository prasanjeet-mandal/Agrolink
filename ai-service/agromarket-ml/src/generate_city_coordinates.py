from geopy.geocoders import Nominatim
from pathlib import Path
import pandas as pd
import time

cities = [
    "Agra", "Ahmedabad", "Amritsar", "Aurangabad",
    "Bangalore", "Bhopal", "Bhubaneswar", "Chandigarh",
    "Chennai", "Coimbatore", "Dehradun", "Delhi",
    "Guwahati", "Hyderabad", "Indore", "Jaipur",
    "Jamshedpur", "Kochi", "Kolkata", "Lucknow",
    "Ludhiana", "Meerut", "Mumbai", "Nagpur",
    "Nashik", "Patna", "Pune", "Raipur", "Ranchi",
    "Shimla", "Srinagar", "Surat",
    "Thiruvananthapuram", "Varanasi", "Vijayawada", "Vizag"
]

# Handle ambiguous/common alternate city names
geocode_names = {
    "Bangalore": "Bengaluru, India",
    "Vizag": "Visakhapatnam, India",
    "Aurangabad": "Chhatrapati Sambhajinagar, Maharashtra, India"
}

geolocator = Nominatim(
    user_agent="agromarket-route-optimizer"
)

results = []

print("Starting city geocoding...")
print(f"Total cities: {len(cities)}")

for i, city in enumerate(cities, start=1):

    search_name = geocode_names.get(
        city,
        f"{city}, India"
    )

    print(f"[{i}/{len(cities)}] Searching: {search_name}")

    try:
        location = geolocator.geocode(
            search_name,
            timeout=10
        )

        if location:
            results.append({
                "city": city,
                "latitude": location.latitude,
                "longitude": location.longitude
            })

            print(
                f"    Found: "
                f"{location.latitude:.6f}, "
                f"{location.longitude:.6f}"
            )

        else:
            print("    NOT FOUND")

    except Exception as e:
        print(f"    ERROR: {e}")

    # Respect geocoding service rate limit
    time.sleep(1)


df = pd.DataFrame(results)

output_dir = (
    Path(__file__).resolve().parents[1]
    / ".."
    / "datasets"
    / "locations"
)

output_dir.mkdir(
    parents=True,
    exist_ok=True
)

output_file = output_dir / "city_coordinates.csv"

df.to_csv(
    output_file,
    index=False
)

print("\n================================")
print("CITY COORDINATES COMPLETE")
print("================================")

print(f"Cities requested: {len(cities)}")
print(f"Cities found: {len(df)}")
print(f"Cities missing: {len(cities) - len(df)}")

if len(df) > 0:
    print("\nGenerated coordinates:")
    print(df.to_string(index=False))

print("\nSaved:")
print(output_file)
