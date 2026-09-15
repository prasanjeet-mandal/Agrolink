import pandas as pd
from pathlib import Path


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATASET_DIR = (
    BASE_DIR.parent
    / "datasets"
    / "mandi"
    / "mandi_dataset"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "all_commodities_cleaned.csv"


# =========================================================
# DATASET COLUMNS
# =========================================================

COLUMNS = [
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
]


# =========================================================
# PROCESS ONE CSV
# =========================================================

def process_file(file_path):

    try:

        df = pd.read_csv(
            file_path,
            header=None,
            names=COLUMNS,
            low_memory=False
        )

        # Commodity name from file name
        df["commodity"] = file_path.stem

        # ---------------------------------------------
        # Date conversion
        # ---------------------------------------------

        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce",
            format="mixed"
        )

        # ---------------------------------------------
        # Numeric conversion
        # ---------------------------------------------

        numeric_columns = [
            "arrivals_tonnes",
            "min_price",
            "max_price",
            "modal_price"
        ]

        for column in numeric_columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

        # ---------------------------------------------
        # Remove missing important values
        # ---------------------------------------------

        df = df.dropna(
            subset=[
                "date",
                "arrivals_tonnes",
                "modal_price"
            ]
        )

        # ---------------------------------------------
        # Remove invalid values
        # ---------------------------------------------

        df = df[
            (df["arrivals_tonnes"] >= 0)
            & (df["min_price"] >= 0)
            & (df["max_price"] >= 0)
            & (df["modal_price"] >= 0)
        ]

        # ---------------------------------------------
        # Remove duplicates
        # ---------------------------------------------

        df = df.drop_duplicates()

        return df

    except Exception as e:

        print(f"ERROR: {file_path.name}")
        print(e)

        return None


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 70)
    print("AGROMARKET - MULTI COMMODITY PREPROCESSING")
    print("=" * 70)

    files = sorted(DATASET_DIR.glob("*.csv"))

    print(f"\nTotal CSV files found: {len(files)}")

    if not files:

        raise FileNotFoundError(
            f"No CSV files found in:\n{DATASET_DIR}"
        )

    # -----------------------------------------------------
    # Delete old output if exists
    # -----------------------------------------------------

    if OUTPUT_FILE.exists():

        print("\nRemoving old output file...")

        OUTPUT_FILE.unlink()

    total_rows = 0
    successful_files = 0
    failed_files = 0

    first_file = True

    # =====================================================
    # PROCESS FILE BY FILE
    # =====================================================

    for index, file_path in enumerate(files, start=1):

        print(
            f"\n[{index}/{len(files)}] "
            f"Processing: {file_path.name}"
        )

        df = process_file(file_path)

        if df is None or df.empty:

            print("  -> Skipped")

            failed_files += 1

            continue

        # -------------------------------------------------
        # IMPORTANT:
        # Append directly to CSV.
        # Do NOT keep all files in RAM.
        # -------------------------------------------------

        df.to_csv(
            OUTPUT_FILE,
            mode="w" if first_file else "a",
            header=first_file,
            index=False
        )

        first_file = False

        rows = len(df)

        total_rows += rows
        successful_files += 1

        print(
            f"  -> Clean rows: {rows:,}"
        )

        # Free memory immediately
        del df

    # =====================================================
    # FINAL SUMMARY
    # =====================================================

    print("\n" + "=" * 70)
    print("PREPROCESSING COMPLETE")
    print("=" * 70)

    print(
        f"Successful files : {successful_files}"
    )

    print(
        f"Failed files     : {failed_files}"
    )

    print(
        f"Total rows       : {total_rows:,}"
    )

    print("\nOutput file:")

    print(OUTPUT_FILE)

    print("\nNow checking output dataset...")

    # -----------------------------------------------------
    # Read only required columns for summary
    # -----------------------------------------------------

    summary_df = pd.read_csv(
        OUTPUT_FILE,
        usecols=["commodity"],
        low_memory=False
    )

    print(
        f"\nTotal commodities: "
        f"{summary_df['commodity'].nunique()}"
    )

    print("\nTop 20 commodities:")

    print(
        summary_df["commodity"]
        .value_counts()
        .head(20)
    )

    del summary_df

    print("\n" + "=" * 70)
    print("DONE")
    print("=" * 70)


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()