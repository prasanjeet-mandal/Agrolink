from pathlib import Path
import json
import re


# ============================================================
# PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

KB_FILE = (
    BASE_DIR
    / "data"
    / "agriculture"
    / "agriculture_knowledge_base.jsonl"
)


# ============================================================
# LOAD KNOWLEDGE BASE
# ============================================================

def load_knowledge_base():

    if not KB_FILE.exists():
        raise FileNotFoundError(
            f"Agriculture knowledge base not found:\n{KB_FILE}"
        )

    records = []

    with open(
        KB_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        for line in file:

            line = line.strip()

            if not line:
                continue

            try:
                record = json.loads(line)
                records.append(record)

            except json.JSONDecodeError:
                continue

    return records


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text):

    text = str(text).lower()

    text = text.replace("-", " ")
    text = text.replace("_", " ")

    text = re.sub(
        r"[^\w\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# CROP MATCHING
# ============================================================

def crop_matches(record_crop, user_crop):

    if not user_crop:
        return True

    record_crop = normalize_text(record_crop)
    user_crop = normalize_text(user_crop)

    return (
        record_crop == user_crop
        or user_crop in record_crop
        or record_crop in user_crop
    )


# ============================================================
# CATEGORY KEYWORDS
# ============================================================

CATEGORY_KEYWORDS = {

    "season": [
        "season",
        "mausam",
        "kab lagaye",
        "kab ugaye",
        "time",
        "samay",
        "month"
    ],

    "duration": [
        "kitne din",
        "days",
        "duration",
        "ready",
        "taiyar",
        "maturity"
    ],

    "soil": [
        "soil",
        "mitti",
        "zameen",
        "land",
        "pH"
    ],

    "seed": [
        "seed",
        "beej",
        "planting material",
        "quality seed"
    ],

    "variety": [
        "variety",
        "kism",
        "kisam",
        "hybrid"
    ],

    "sowing": [
        "sowing",
        "boyai",
        "bonai",
        "beej kab",
        "planting"
    ],

    "nursery": [
        "nursery",
        "seedling",
        "paudh"
    ],

    "transplanting": [
        "transplant",
        "ropai",
        "ropan"
    ],

    "fertilizer": [
        "fertilizer",
        "khad",
        "urea",
        "npk",
        "dap",
        "nutrient",
        "poshak"
    ],

    "irrigation": [
        "irrigation",
        "pani",
        "water",
        "sinchai"
    ],

    "weed": [
        "weed",
        "ghaas",
        "kharpatwar"
    ],

    "insect": [
        "insect",
        "keeda",
        "kida",
        "pest",
        "bug"
    ],

    "disease": [
        "disease",
        "rog",
        "bimari",
        "fungus",
        "infection"
    ],

    "symptoms": [
        "symptom",
        "lakshan",
        "nishan",
        "yellow",
        "peela",
        "spot",
        "daag"
    ],

    "pest_management": [
        "pest management",
        "control",
        "keeda kaise roke",
        "pest control",
        "spray"
    ],

    "weather": [
        "weather",
        "mausam",
        "rain",
        "barish",
        "temperature",
        "humidity",
        "garmi",
        "thand"
    ],

    "yield": [
        "yield",
        "production",
        "utpadan",
        "kitna milega",
        "paidaavar"
    ],

    "harvesting": [
        "harvest",
        "katai",
        "todai",
        "kab kate",
        "kab tod"
    ],

    "storage": [
        "storage",
        "store",
        "bhandaran",
        "rakhna",
        "shelf life"
    ],

    "market": [
        "market",
        "mandi",
        "bazaar",
        "sell",
        "bechna"
    ],

    "price": [
        "price",
        "rate",
        "bhav",
        "daam",
        "mandi price"
    ],

    "arrival": [
        "arrival",
        "arrivals",
        "mandi arrival"
    ],

    "cultivation": [
        "cultivation",
        "farming",
        "kheti",
        "ugana",
        "kaise ugaye"
    ],

    "general": [
        "information",
        "basic",
        "about",
        "jaankari"
    ]
}


# ============================================================
# DETECT CATEGORY
# ============================================================

def detect_category(question):

    question = normalize_text(question)

    scores = {}

    for category, keywords in CATEGORY_KEYWORDS.items():

        score = 0

        for keyword in keywords:

            keyword = normalize_text(keyword)

            if keyword in question:
                score += 1

        scores[category] = score

    best_category = max(
        scores,
        key=scores.get
    )

    if scores[best_category] == 0:
        return None

    return best_category


# ============================================================
# SEARCH KNOWLEDGE BASE
# ============================================================

def search_agriculture(
    question,
    crop=None,
    category=None,
    top_k=3
):

    records = load_knowledge_base()

    question_normalized = normalize_text(
        question
    )

    if category is None:
        category = detect_category(
            question
        )

    results = []

    for record in records:

        record_crop = record.get(
            "crop",
            ""
        )

        record_category = record.get(
            "category",
            ""
        )

        # Crop filtering
        if crop and not crop_matches(
            record_crop,
            crop
        ):
            continue

        score = 0

        # Category match
        if category:

            if normalize_text(
                record_category
            ) == normalize_text(category):

                score += 10

        # Question matching
        record_question = normalize_text(
            record.get(
                "question",
                ""
            )
        )

        record_answer = normalize_text(
            record.get(
                "answer",
                ""
            )
        )

        question_words = set(
            question_normalized.split()
        )

        record_words = set(
            record_question.split()
        )

        common_words = (
            question_words
            & record_words
        )

        score += len(common_words)

        # Answer keyword matching
        answer_words = set(
            record_answer.split()
        )

        common_answer_words = (
            question_words
            & answer_words
        )

        score += len(
            common_answer_words
        )

        if score > 0:

            results.append(
                (
                    score,
                    record
                )
            )

    # Highest score first
    results.sort(
        key=lambda x: x[0],
        reverse=True
    )

    return [
        record
        for score, record
        in results[:top_k]
    ]


# ============================================================
# BUILD CONTEXT
# ============================================================

def build_context(
    question,
    crop=None,
    category=None,
    top_k=3
):

    results = search_agriculture(
        question=question,
        crop=crop,
        category=category,
        top_k=top_k
    )

    if not results:
        return ""

    context_parts = []

    for record in results:

        context_parts.append(
            f"""
Crop: {record.get('crop', '')}
Category: {record.get('category', '')}
Question: {record.get('question', '')}
Knowledge: {record.get('answer', '')}
Source Type: {record.get('source_type', '')}
Verified: {record.get('verified', False)}
"""
        )

    return "\n".join(
        context_parts
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AGROMARK AGRICULTURE RAG TEST")
    print("=" * 60)

    print(
        f"\nKnowledge Base:\n{KB_FILE}"
    )

    records = load_knowledge_base()

    print(
        f"\nTotal records loaded: {len(records)}"
    )

    questions = [
        "Tomato mein fertilizer kaise manage karein?",
        "Potato mein kaunse insects aa sakte hain?",
        "Rice ki irrigation kaise karein?",
        "Apple ko kab harvest karna chahiye?"
    ]

    for question in questions:

        print("\n" + "-" * 60)

        category = detect_category(
            question
        )

        print(
            f"Question : {question}"
        )

        print(
            f"Category : {category}"
        )

        results = search_agriculture(
            question=question,
            top_k=1
        )

        if results:

            result = results[0]

            print(
                f"Crop     : {result['crop']}"
            )

            print(
                f"Answer   : {result['answer']}"
            )

        else:

            print(
                "No knowledge found."
            )
            