import requests

BASE_URL = "http://127.0.0.1:8000"

payload = {
    "market": "Roorkee APMC",
    "category": "Vegetables",
    "product": "Tomato"
}

print("Testing health...")
r = requests.get(f"{BASE_URL}/health")
print(r.status_code, r.json())

print("\nTesting PRICE...")
r = requests.post(f"{BASE_URL}/predict/price", json=payload)
print(r.status_code, r.json())

print("\nTesting DEMAND...")
r = requests.post(f"{BASE_URL}/predict/demand", json=payload)
print(r.status_code, r.json())

print("\nTesting SUPPLY...")
r = requests.post(f"{BASE_URL}/predict/supply", json=payload)
print(r.status_code, r.json())
