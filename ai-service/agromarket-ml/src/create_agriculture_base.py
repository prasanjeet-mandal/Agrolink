from pathlib import Path
import json


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

FEATURE_DIR = BASE_DIR / "data" / "processed" / "commodities"

OUTPUT_DIR = BASE_DIR / "data" / "agriculture"

OUTPUT_FILE = OUTPUT_DIR / "agriculture_knowledge_base.jsonl"


# ============================================================
# AGRICULTURE KNOWLEDGE CATEGORIES
# ============================================================

CATEGORIES = [
    "general",
    "season",
    "duration",
    "soil",
    "seed",
    "variety",
    "sowing",
    "nursery",
    "transplanting",
    "fertilizer",
    "irrigation",
    "weed",
    "insect",
    "disease",
    "symptoms",
    "pest_management",
    "weather",
    "yield",
    "harvesting",
    "storage",
    "market",
    "price",
    "arrival",
    "cultivation",
]


# ============================================================
# CLEAN COMMODITY NAME
# ============================================================

def clean_crop_name(filename):
    """
    Example:

    Tomato_features.csv
    -> Tomato

    Potato_features.csv
    -> Potato
    """

    name = filename.replace("_features.csv", "")
    name = name.replace("_features", "")

    return name.strip()


# ============================================================
# CREATE KNOWLEDGE RECORD
# ============================================================

def make_record(crop, category):

    crop_display = crop.replace("_", " ")

    # --------------------------------------------------------
    # QUESTIONS
    # --------------------------------------------------------

    questions = {

        "general":
            f"{crop_display} ki farming ka basic information kya hai?",

        "season":
            f"{crop_display} ki farming kis season mein hoti hai?",

        "duration":
            f"{crop_display} crop kitne din mein ready hoti hai?",

        "soil":
            f"{crop_display} ke liye kaisi soil suitable hai?",

        "seed":
            f"{crop_display} ke liye seed kaise select karein?",

        "variety":
            f"{crop_display} ki achhi variety kaise choose karein?",

        "sowing":
            f"{crop_display} ki sowing kaise karein?",

        "nursery":
            f"{crop_display} ki nursery kaise prepare karein?",

        "transplanting":
            f"{crop_display} mein transplanting kaise hoti hai?",

        "fertilizer":
            f"{crop_display} mein fertilizer kaise manage karein?",

        "irrigation":
            f"{crop_display} mein irrigation kaise manage karein?",

        "weed":
            f"{crop_display} mein weeds ko kaise control karein?",

        "insect":
            f"{crop_display} mein kaunse insects aa sakte hain?",

        "disease":
            f"{crop_display} mein kaunse diseases common hain?",

        "symptoms":
            f"{crop_display} mein disease ke symptoms kaise identify karein?",

        "pest_management":
            f"{crop_display} mein pest management kaise karein?",

        "weather":
            f"{crop_display} ke liye weather ka kya importance hai?",

        "yield":
            f"{crop_display} ka yield kin factors par depend karta hai?",

        "harvesting":
            f"{crop_display} ko kab harvest karna chahiye?",

        "storage":
            f"{crop_display} ko harvest ke baad kaise store karein?",

        "market":
            f"{crop_display} ko market mein sell karte waqt kya dekhein?",

        "price":
            f"{crop_display} ka mandi price kaise check karein?",

        "arrival":
            f"{crop_display} ki mandi arrivals kya hoti hain?",

        "cultivation":
            f"{crop_display} ki cultivation ka basic process kya hai?",
    }

    # --------------------------------------------------------
    # ANSWERS
    # --------------------------------------------------------

    answers = {

        "general":
            (
                f"{crop_display} ki farming ke liye soil, season, variety, "
                "seed quality, irrigation, nutrient management, pest/disease "
                "monitoring aur harvesting ka dhyan rakhna important hai."
            ),

        "season":
            (
                f"{crop_display} ka suitable season region aur variety ke "
                "according change ho sakta hai. Local agricultural university "
                "ya KVK recommendation follow karni chahiye."
            ),

        "duration":
            (
                f"{crop_display} ki crop duration variety, season, temperature "
                "aur farming method par depend karti hai."
            ),

        "soil":
            (
                f"{crop_display} ke liye suitable soil crop aur region ke "
                "according different ho sakti hai. Soil test ke basis par "
                "management karna better hai."
            ),

        "seed":
            (
                "Healthy, clean aur quality/certified seed choose karein. "
                "Variety ko local climate aur recommended package of practices "
                "ke according select karein."
            ),

        "variety":
            (
                f"{crop_display} ki variety select karte waqt local climate, "
                "soil, disease resistance, market requirement aur crop duration "
                "ko consider karein."
            ),

        "sowing":
            (
                f"Sowing time, seed rate, depth aur spacing {crop_display} ki "
                "variety aur local recommendation par depend karte hain."
            ),

        "nursery":
            (
                f"Agar {crop_display} ke liye nursery system use hota hai, "
                "to healthy seed, clean nursery area, proper moisture aur "
                "drainage important hain."
            ),

        "transplanting":
            (
                f"{crop_display} mein transplanting crop-specific hoti hai. "
                "Seedling age, spacing, soil moisture aur local recommended "
                "practice ko follow karna chahiye."
            ),

        "fertilizer":
            (
                f"{crop_display} mein fertilizer management soil test aur "
                "crop requirement ke basis par karna chahiye. Balanced nutrient "
                "management sirf ek fertilizer par depend karne se better hai."
            ),

        "irrigation":
            (
                f"Irrigation {crop_display} ke crop stage, soil type, rainfall "
                "aur weather par depend karti hai. Over-irrigation aur water "
                "stress dono avoid karne ki koshish karein."
            ),

        "weed":
            (
                f"{crop_display} mein weed management ke liye timely field "
                "monitoring, suitable cultural practices aur approved "
                "weed-control methods ka use kiya ja sakta hai."
            ),

        "insect":
            (
                f"{crop_display} mein insects region aur crop stage ke "
                "according different ho sakte hain. Pehle insect ko correctly "
                "identify karein aur unnecessary pesticide spray avoid karein."
            ),

        "disease":
            (
                f"{crop_display} mein diseases weather, soil, seed quality "
                "aur crop management se related ho sakte hain. Correct "
                "diagnosis ke baad management karna important hai."
            ),

        "symptoms":
            (
                f"{crop_display} ke symptoms identify karte waqt leaf, stem, "
                "root, fruit/seed aur complete plant ko observe karein. "
                "Similar symptoms multiple causes se ho sakte hain."
            ),

        "pest_management":
            (
                f"{crop_display} ke Integrated Pest Management (IPM) mein "
                "monitoring, cultural methods, biological control aur "
                "need-based approved chemical control combine kiya jata hai."
            ),

        "weather":
            (
                f"Temperature, rainfall, humidity, wind aur extreme weather "
                f"{crop_display} ki growth aur pest/disease risk ko affect "
                "kar sakte hain."
            ),

        "yield":
            (
                f"{crop_display} ka yield variety, seed quality, soil fertility, "
                "irrigation, weather, pest/disease management aur farming "
                "practices par depend karta hai."
            ),

        "harvesting":
            (
                f"{crop_display} ki harvesting crop maturity, variety, produce "
                "quality aur weather conditions ke according karni chahiye."
            ),

        "storage":
            (
                f"{crop_display} ke harvest ke baad produce ko clean, dry aur "
                "suitable storage condition mein rakhna quality loss aur "
                "spoilage ko reduce karne mein help karta hai."
            ),

        "market":
            (
                f"{crop_display} ke market selection mein current mandi price, "
                "transportation cost, quality requirements aur demand ko "
                "consider karein."
            ),

        "price":
            (
                f"{crop_display} ke mandi price ke liye current mandi ya "
                "AGMARKNET data check karna better hai. Historical ML prediction "
                "ko actual live price ka replacement nahi samajhna chahiye."
            ),

        "arrival":
            (
                f"{crop_display} ki mandi arrival ka matlab mandi mein aane "
                "wali commodity quantity hai. Ye consumer demand ke exactly "
                "same nahi hoti."
            ),

        "cultivation":
            (
                f"{crop_display} cultivation mein suitable variety, quality "
                "seed, proper sowing, nutrient management, irrigation, weed "
                "control, pest/disease monitoring aur timely harvesting "
                "important steps hain."
            ),
    }

    # --------------------------------------------------------
    # FINAL RECORD
    # --------------------------------------------------------

    return {
        "crop": crop,
        "category": category,
        "question": questions[category],
        "answer": answers[category],
        "source": (
            "Agriculture Knowledge Base - "
            "crop-specific official source verification required"
        ),
        "source_type": "generic_template",
        "verified": False
    }


# ============================================================
# MAIN FUNCTION
# ============================================================

def main():

    print("=" * 60)
    print("AGROMARK AGRICULTURE KNOWLEDGE BASE GENERATOR")
    print("=" * 60)

    # Create output directory
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # FIND ALL COMMODITY FILES
    # --------------------------------------------------------

    feature_files = sorted(
        FEATURE_DIR.glob("*_features.csv")
    )

    if not feature_files:

        print("\nERROR: No commodity feature files found.")

        print("\nExpected folder:")
        print(FEATURE_DIR)

        return

    # --------------------------------------------------------
    # EXTRACT COMMODITY NAMES
    # --------------------------------------------------------

    commodities = []

    for file in feature_files:

        crop = clean_crop_name(
            file.name
        )

        if crop:
            commodities.append(crop)

    # Remove duplicates
    commodities = sorted(
        set(commodities),
        key=str.lower
    )

    print()
    print(f"Found commodities : {len(commodities)}")
    print(f"Categories        : {len(CATEGORIES)}")

    # --------------------------------------------------------
    # CREATE JSONL FILE
    # --------------------------------------------------------

    total_records = 0

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        for crop in commodities:

            for category in CATEGORIES:

                record = make_record(
                    crop=crop,
                    category=category
                )

                f.write(
                    json.dumps(
                        record,
                        ensure_ascii=False
                    )
                    + "\n"
                )

                total_records += 1

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("Agriculture Knowledge Base Created Successfully")
    print("=" * 60)

    print(f"Commodities : {len(commodities)}")
    print(f"Categories  : {len(CATEGORIES)}")
    print(f"Records     : {total_records}")

    print()
    print("Output file:")
    print(OUTPUT_FILE)

    print()
    print("Example commodities:")

    for crop in commodities[:10]:
        print(f"  - {crop}")

    print()
    print("Example categories:")

    for category in CATEGORIES:
        print(f"  - {category}")

    print()
    print("=" * 60)


# ============================================================
# PROGRAM START
# ============================================================

if __name__ == "__main__":
    main()