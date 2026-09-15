import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MATRIX_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "dtdc_distance_matrix.csv"
)

_distance_matrix = None


def load_distance_matrix():
    global _distance_matrix

    if _distance_matrix is None:
        if not os.path.exists(MATRIX_PATH):
            raise FileNotFoundError(
                f"Distance matrix not found: {MATRIX_PATH}"
            )

        data = pd.read_csv(MATRIX_PATH)

        data["Unnamed: 0"] = (
            data["Unnamed: 0"]
            .astype(str)
            .str.strip()
            .str.strip("'")
            .str.strip('"')
        )

        data.columns = [
            str(col).strip().strip("'").strip('"')
            for col in data.columns
        ]

        data = data.set_index("Unnamed: 0")

        _distance_matrix = data

    return _distance_matrix


def get_distance(source: str, destination: str):
    matrix = load_distance_matrix()

    source = source.strip().strip("'").strip('"')
    destination = destination.strip().strip("'").strip('"')

    if source not in matrix.index:
        return {
            "available": False,
            "source": source,
            "destination": destination,
            "distance_km": None,
            "reason": f"Source city '{source}' is not available in distance matrix"
        }

    if destination not in matrix.columns:
        return {
            "available": False,
            "source": source,
            "destination": destination,
            "distance_km": None,
            "reason": f"Destination city '{destination}' is not available in distance matrix"
        }

    distance = matrix.loc[source, destination]

    return {
        "available": True,
        "source": source,
        "destination": destination,
        "distance_km": round(float(distance), 2)
    }
