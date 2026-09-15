import shutil
from pathlib import Path


# ==========================================
# PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[1]

SOURCE_DIR = (
    BASE_DIR.parent
    / "datasets"
    / "mandi"
    / "mandi_dataset"
)

TARGET_DIR = (
    BASE_DIR.parent
    / "datasets"
    / "mandi"
    / "mandi_selected"
)

TARGET_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# IMPORTANT COMMODITIES
# ==========================================

IMPORTANT_COMMODITIES = [
    # Vegetables
    "Ashgourd",
    "Beetroot",
    "Bhindi(Ladies Finger)",
    "Bitter gourd",
    "Bottle gourd",
    "Brinjal",
    "Cabbage",
    "Capsicum",
    "Carrot",
    "Cauliflower",
    "Chow Chow",
    "Cluster beans",
    "Colacasia",
    "Cucumbar(Kheera)",
    "Drumstick",
    "Elephant Yam (Suran)",
    "French Beans (Frasbean)",
    "Garlic",
    "Ginger(Green)",
    "Green Chilli",
    "Green Peas",
    "Lady's Finger",
    "Lemon",
    "Little gourd (Kundru)",
    "Onion Green",
    "Onion",
    "Papaya (Raw)",
    "Peas Wet",
    "Pointed gourd (Parval)",
    "Potato",
    "Pumpkin",
    "Raddish",
    "Ridgeguard(Tori)",
    "Snakeguard",
    "Spinach",
    "Sponge gourd",
    "Sweet Potato",
    "Sweet Pumpkin",
    "Tinda",
    "Tomato",

    # Fruits
    "Apple",
    "Apricot(Jardalu-Khumani)",
    "Banana",
    "Banana - Green",
    "Chikoos(Sapota)",
    "Custard Apple (Sharifa)",
    "Grapes",
    "Guava",
    "Jack Fruit",
    "Jamun(Narale Hannu)",
    "Karbuja(Musk Melon)",
    "Kinnow",
    "Litchi",
    "Mango",
    "Mango (Raw-Ripe)",
    "Mousambi(Sweet Lime)",
    "Orange",
    "Papaya",
    "Peach",
    "Pear(Marasebu)",
    "Pineapple",
    "Plum",
    "Pomegranate",
    "Persimon(Japani Fal)",

    # Cereals / Grains
    "Bajra(Pearl Millet-Cumbu)",
    "Barley (Jau)",
    "Jowar(Sorghum)",
    "Maize",
    "Paddy(Dhan)(Basmati)",
    "Paddy(Dhan)(Common)",
    "Ragi (Finger Millet)",
    "Rice",
    "Wheat",

    # Pulses
    "Arhar (Tur-Red Gram)(Whole)",
    "Arhar Dal(Tur Dal)",
    "Bengal Gram Dal (Chana Dal)",
    "Bengal Gram(Gram)(Whole)",
    "Black Gram (Urd Beans)(Whole)",
    "Black Gram Dal (Urd Dal)",
    "Cowpea (Lobia-Karamani)",
    "Green Gram (Moong)(Whole)",
    "Green Gram Dal (Moong Dal)",
    "Kabuli Chana(Chickpeas-White)",
    "Lentil (Masur)(Whole)",
    "Masur Dal",
    "Red Gram",

    # Oilseeds
    "Castor Seed",
    "Ground Nut Seed",
    "Groundnut",
    "Groundnut pods (raw)",
    "Mustard",
    "Sesamum(SesameGingellyTil)",
    "Soyabean",
    "Sunflower",
    "Sunflower Seed",

    # Spices
    "Black pepper",
    "Chili Red",
    "Chilly Capsicum",
    "Coriander(Leaves)",
    "Corriander seed",
    "Cummin Seed(Jeera)",
    "Dry Chillies",
    "Ginger(Dry)",
    "Methi Seeds",
    "Mint(Pudina)",
    "Nutmeg",
    "Pepper garbled",
    "Pepper ungarbled",
    "Safflower",
    "Tamarind Fruit",
    "Tamarind Seed",

    # Other important agricultural commodities
    "Arecanut(Betelnut-Supari)",
    "Coconut",
    "Copra",
    "Cotton",
    "Cotton Seed",
    "Gur(Jaggery)",
    "Jute",
    "Sugar",
    "Sugarcane",
    "Tapioca",
]


# ==========================================
# COPY SELECTED FILES
# ==========================================

def main():

    print("=" * 60)
    print("SELECTING IMPORTANT AGRICULTURAL COMMODITIES")
    print("=" * 60)

    source_files = {
        file.stem: file
        for file in SOURCE_DIR.glob("*.csv")
    }

    print(f"\nOriginal files: {len(source_files)}")

    copied = 0
    missing = []

    for commodity in IMPORTANT_COMMODITIES:

        source_file = source_files.get(commodity)

        if source_file is None:
            missing.append(commodity)
            continue

        target_file = TARGET_DIR / source_file.name

        shutil.copy2(
            source_file,
            target_file
        )

        copied += 1

        print(
            f"[{copied}] Copied: {commodity}"
        )

    print("\n" + "=" * 60)
    print("SELECTION COMPLETE")
    print("=" * 60)

    print(
        f"Selected commodities : {copied}"
    )

    print(
        f"Missing commodities  : {len(missing)}"
    )

    if missing:

        print("\nNot found:")

        for item in missing:
            print("-", item)

    print("\nNew dataset location:")

    print(TARGET_DIR)

    print("=" * 60)


if __name__ == "__main__":
    main()