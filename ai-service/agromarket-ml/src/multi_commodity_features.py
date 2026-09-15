import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

DATASET_DIR = (
    BASE_DIR.parent
    / "datasets"
    / "mandi"
    / "mandi_selected"
)

OUTPUT_DIR = (
    BASE_DIR
    / "data"
    / "processed"
    / "commodities"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 50000
MIN_ROWS_REQUIRED = 1000


def process_commodity(file_path):

    commodity = file_path.stem

    print("\n" + "=" * 60)
    print(f"Processing: {commodity}")
    print("=" * 60)

    chunks = []
    total_rows = 0

    for chunk in pd.read_csv(
        file_path,
        header=None,
        names=[
            "state",
            "district",
            "market",
            "commodity",
            "group",
            "arrivals_tonnes",
            "min_price",
            "max_price",
            "modal_price",
            "date"
        ],
        chunksize=CHUNK_SIZE
    ):

        chunk["date"] = pd.to_datetime(
            chunk["date"],
            errors="coerce",
            format="mixed"
        )

        numeric_cols = [
            "arrivals_tonnes",
            "min_price",
            "max_price",
            "modal_price"
        ]

        for col in numeric_cols:
            chunk[col] = pd.to_numeric(
                chunk[col],
                errors="coerce"
            )

        chunk = chunk.dropna(
            subset=[
                "date",
                "arrivals_tonnes",
                "modal_price"
            ]
        )

        chunk = chunk[
            (chunk["arrivals_tonnes"] >= 0) &
            (chunk["min_price"] >= 0) &
            (chunk["max_price"] >= 0) &
            (chunk["modal_price"] >= 0)
        ]

        if not chunk.empty:
            chunks.append(chunk)
            total_rows += len(chunk)

        del chunk

    if total_rows < MIN_ROWS_REQUIRED:
        print(f"SKIPPED: only {total_rows} rows")
        return

    df = pd.concat(chunks, ignore_index=True)
    del chunks

    df = df.sort_values(["market", "date"])

    # Date features
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.dayofweek
    df["week_of_year"] = (
        df["date"].dt.isocalendar().week.astype(int)
    )

    grouped = df.groupby("market", group_keys=False)

    # Price lag features
    df["price_lag_1"] = grouped["modal_price"].shift(1)
    df["price_lag_7"] = grouped["modal_price"].shift(7)
    df["price_lag_30"] = grouped["modal_price"].shift(30)

    # Arrival lag features
    df["arrival_lag_1"] = grouped["arrivals_tonnes"].shift(1)
    df["arrival_lag_7"] = grouped["arrivals_tonnes"].shift(7)
    df["arrival_lag_30"] = grouped["arrivals_tonnes"].shift(30)

    # Price rolling features
    df["price_rolling_mean_7"] = grouped["modal_price"].transform(
        lambda x: x.shift(1).rolling(7).mean()
    )

    df["price_rolling_mean_30"] = grouped["modal_price"].transform(
        lambda x: x.shift(1).rolling(30).mean()
    )

    # Arrival rolling features
    df["arrival_rolling_mean_7"] = grouped["arrivals_tonnes"].transform(
        lambda x: x.shift(1).rolling(7).mean()
    )

    df["arrival_rolling_mean_30"] = grouped["arrivals_tonnes"].transform(
        lambda x: x.shift(1).rolling(30).mean()
    )

    # Remove rows where lag/rolling history is unavailable
    df = df.dropna(
        subset=[
            "price_lag_1",
            "price_lag_7",
            "price_lag_30",
            "arrival_lag_1",
            "arrival_lag_7",
            "arrival_lag_30",
            "price_rolling_mean_7",
            "price_rolling_mean_30",
            "arrival_rolling_mean_7",
            "arrival_rolling_mean_30"
        ]
    )

    output_file = OUTPUT_DIR / f"{commodity}_features.csv"

    df.to_csv(output_file, index=False)

    print(f"Original clean rows : {total_rows:,}")
    print(f"Feature rows        : {len(df):,}")
    print(f"Markets             : {df['market'].nunique()}")
    print(f"Saved               : {output_file}")

    del df


def main():

    print("=" * 60)
    print("MULTI-COMMODITY FEATURE ENGINEERING")
    print("=" * 60)

    files = sorted(DATASET_DIR.glob("*.csv"))

    print(f"Products found: {len(files)}")

    for index, file_path in enumerate(files, start=1):

        print(f"\n[{index}/{len(files)}]")

        try:
            process_commodity(file_path)

        except Exception as e:
            print(f"ERROR: {file_path.name}")
            print(e)

    print("\n" + "=" * 60)
    print("ALL FEATURE ENGINEERING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
