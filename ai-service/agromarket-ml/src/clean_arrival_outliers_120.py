import pandas as pd
import numpy as np
import os

INPUT_FILE = "data/demand/processed/arrival_district_features_120.csv"
OUTPUT_FILE = "data/demand/processed/arrival_district_clean_120.csv"

print("=" * 70)
print("MEMORY-SAFE 120-PRODUCT OUTLIER CLEANING")
print("=" * 70)

# ---------------------------------------------------------
# STEP 1: Calculate group statistics
# ---------------------------------------------------------

print("\nStep 1: Calculating group statistics...")

stats = pd.read_csv(
    INPUT_FILE,
    usecols=[
        "product",
        "state",
        "district",
        "arrivals_tonnes"
    ]
)

stats["arrivals_tonnes"] = pd.to_numeric(
    stats["arrivals_tonnes"],
    errors="coerce"
)

stats = stats.dropna(
    subset=[
        "product",
        "state",
        "district",
        "arrivals_tonnes"
    ]
)

group_cols = [
    "product",
    "state",
    "district"
]

group_stats = (
    stats.groupby(group_cols)["arrivals_tonnes"]
    .agg(
        q1=lambda x: x.quantile(0.25),
        q3=lambda x: x.quantile(0.75),
        median="median"
    )
    .reset_index()
)

group_stats["iqr"] = (
    group_stats["q3"] -
    group_stats["q1"]
)

group_stats["upper_bound"] = (
    group_stats["q3"] +
    3.0 * group_stats["iqr"]
)

group_stats["upper_bound"] = np.maximum(
    group_stats["upper_bound"],
    group_stats["median"]
)

print(
    "Groups:",
    len(group_stats)
)

# ---------------------------------------------------------
# Save statistics
# ---------------------------------------------------------

STATS_FILE = "data/demand/processed/arrival_outlier_stats_120.csv"

group_stats.to_csv(
    STATS_FILE,
    index=False
)

del stats

print("Statistics saved.")

# ---------------------------------------------------------
# STEP 2: Chunk-wise cleaning
# ---------------------------------------------------------

print("\nStep 2: Cleaning dataset in chunks...")

if os.path.exists(OUTPUT_FILE):
    os.remove(OUTPUT_FILE)

chunksize = 300000

total_rows = 0
kept_rows = 0
removed_rows = 0

first_chunk = True

for chunk_no, chunk in enumerate(
    pd.read_csv(
        INPUT_FILE,
        chunksize=chunksize
    ),
    start=1
):

    print(
        f"\rProcessing chunk {chunk_no}...",
        end=""
    )

    total_rows += len(chunk)

    chunk["arrivals_tonnes"] = pd.to_numeric(
        chunk["arrivals_tonnes"],
        errors="coerce"
    )

    chunk = chunk.dropna(
        subset=[
            "product",
            "state",
            "district",
            "arrivals_tonnes"
        ]
    )

    # Merge only small group-statistics table
    chunk = chunk.merge(
        group_stats[
            group_cols + ["upper_bound"]
        ],
        on=group_cols,
        how="left"
    )

    # Identify extreme observations
    outlier_mask = (
        chunk["arrivals_tonnes"] >
        chunk["upper_bound"]
    )

    removed_rows += int(
        outlier_mask.sum()
    )

    clean_chunk = chunk.loc[
        ~outlier_mask
    ].drop(
        columns=["upper_bound"]
    )

    kept_rows += len(clean_chunk)

    clean_chunk.to_csv(
        OUTPUT_FILE,
        mode="w" if first_chunk else "a",
        header=first_chunk,
        index=False
    )

    first_chunk = False

    del chunk
    del clean_chunk

# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

print("\n\n" + "=" * 70)
print("OUTLIER CLEANING COMPLETE")
print("=" * 70)

print(
    "Original rows:",
    total_rows
)

print(
    "Clean rows:",
    kept_rows
)

print(
    "Removed rows:",
    removed_rows
)

print(
    "Outlier percentage:",
    f"{(removed_rows / total_rows) * 100:.4f}%"
)

print(
    "Groups:",
    len(group_stats)
)

print(
    "Products:",
    group_stats["product"].nunique()
)

print(
    "States:",
    group_stats["state"].nunique()
)

print(
    "Districts:",
    group_stats["district"].nunique()
)

print(
    "\nSaved cleaned dataset:"
)

print(
    os.path.abspath(OUTPUT_FILE)
)

print("\nDONE!")

