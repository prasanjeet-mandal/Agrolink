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
    / "arrival_commodities"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 50000
MIN_ROWS_REQUIRED = 1000


def process_commodity(file_path):

    commodity = file_path.stem

    print("\n" + "=" * 60)
    print(f"Processing Arrival Data: {commodity}")
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

        # Date conversion
        chunk["date"] = pd.to_datetime(
            chunk["date"],
            errors="coerce",
            format="mixed"
        )

        # Numeric conversion
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

        # Required values
        chunk = chunk.dropna(
            subset=[
                "date",
                "arrivals_tonnes"
            ]
        )

        # Remove invalid values
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

    # Combine chunks
    df = pd.concat(
        chunks,
        ignore_index=True
    )

    del chunks

    # Sort market-wise by date
    df = df.sort_values(
        ["market", "date"]
    )

    # ------------------------------------------------
    # DATE FEATURES
    # ------------------------------------------------

    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day

    df["day_of_week"] = (
        df["date"].dt.dayofweek
    )

    df["week_of_year"] = (
        df["date"]
        .dt.isocalendar()
        .week
        .astype(int)
    )

    # ------------------------------------------------
    # MARKET-WISE GROUP
    # ------------------------------------------------

    grouped = df.groupby(
        "market",
        group_keys=False
    )

    # ------------------------------------------------
    # ARRIVAL LAGS
    # ------------------------------------------------

    df["arrival_lag_1"] = (
        grouped["arrivals_tonnes"]
        .shift(1)
    )

    df["arrival_lag_7"] = (
        grouped["arrivals_tonnes"]
        .shift(7)
    )

    df["arrival_lag_30"] = (
        grouped["arrivals_tonnes"]
        .shift(30)
    )

    # ------------------------------------------------
    # ARRIVAL ROLLING FEATURES
    # ------------------------------------------------

    df["arrival_rolling_mean_7"] = (
        grouped["arrivals_tonnes"]
        .transform(
            lambda x:
            x.shift(1)
            .rolling(7)
            .mean()
        )
    )

    df["arrival_rolling_mean_30"] = (
        grouped["arrivals_tonnes"]
        .transform(
            lambda x:
            x.shift(1)
            .rolling(30)
            .mean()
        )
    )

    df["arrival_rolling_std_7"] = (
        grouped["arrivals_tonnes"]
        .transform(
            lambda x:
            x.shift(1)
            .rolling(7)
            .std()
        )
    )

    # ------------------------------------------------
    # PRICE INFORMATION
    # ------------------------------------------------

    # Previous market prices can help explain
    # expected mandi arrivals.

    df["price_lag_1"] = (
        grouped["modal_price"]
        .shift(1)
    )

    df["price_lag_7"] = (
        grouped["modal_price"]
        .shift(7)
    )

    df["price_rolling_mean_7"] = (
        grouped["modal_price"]
        .transform(
            lambda x:
            x.shift(1)
            .rolling(7)
            .mean()
        )
    )

    # ------------------------------------------------
    # REMOVE ROWS WITHOUT HISTORY
    # ------------------------------------------------

    required_features = [
        "arrival_lag_1",
        "arrival_lag_7",
        "arrival_lag_30",
        "arrival_rolling_mean_7",
        "arrival_rolling_mean_30",
        "arrival_rolling_std_7",
        "price_lag_1",
        "price_lag_7",
        "price_rolling_mean_7"
    ]

    df = df.dropna(
        subset=required_features
    )

    # ------------------------------------------------
    # SAVE
    # ------------------------------------------------

    output_file = (
        OUTPUT_DIR /
        f"{commodity}_arrival_features.csv"
    )

    df.to_csv(
        output_file,
        index=False
    )

    print(f"Original clean rows : {total_rows:,}")
    print(f"Feature rows        : {len(df):,}")
    print(f"Markets             : {df['market'].nunique()}")
    print(f"Saved               : {output_file.name}")

    del df


def main():

    print("=" * 60)
    print("MULTI-COMMODITY ARRIVAL FEATURE ENGINEERING")
    print("=" * 60)

    files = sorted(
        DATASET_DIR.glob("*.csv")
    )

    print(
        f"Products found: {len(files)}"
    )

    for index, file_path in enumerate(
        files,
        start=1
    ):

        print(
            f"\n[{index}/{len(files)}]"
        )

        try:

            process_commodity(
                file_path
            )

        except Exception as e:

            print(
                f"ERROR: {file_path.name}"
            )

            print(e)

    print("\n" + "=" * 60)
    print(
        "ARRIVAL FEATURE ENGINEERING COMPLETE"
    )
    print("=" * 60)


if __name__ == "__main__":
    main()