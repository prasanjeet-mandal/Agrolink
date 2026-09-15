from pathlib import Path


# ==========================================
# PATH
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATASET_DIR = (
    BASE_DIR.parent
    / "datasets"
    / "mandi"
    / "mandi_selected"
)


# ==========================================
# MAIN
# ==========================================

def main():

    print("=" * 60)
    print("SELECTED DATASET VERIFICATION")
    print("=" * 60)

    files = sorted(DATASET_DIR.glob("*.csv"))

    if not files:
        print("\nNo CSV files found!")
        return

    total_size = 0

    print(f"\nTotal selected files: {len(files)}")

    print("\nFiles:")

    for i, file in enumerate(files, start=1):

        size_mb = file.stat().st_size / (1024 * 1024)

        total_size += size_mb

        print(
            f"{i:3}. {file.stem:<45} "
            f"{size_mb:8.2f} MB"
        )

    print("\n" + "=" * 60)

    print(
        f"Total dataset size: {total_size:.2f} MB"
    )

    print(
        f"Total dataset size: {total_size / 1024:.2f} GB"
    )

    print("=" * 60)

    print("\nLargest 10 files:")

    largest = sorted(
        files,
        key=lambda x: x.stat().st_size,
        reverse=True
    )[:10]

    for i, file in enumerate(largest, start=1):

        size_mb = file.stat().st_size / (1024 * 1024)

        print(
            f"{i}. {file.stem} -> "
            f"{size_mb:.2f} MB"
        )

    print("\nVerification complete.")


if __name__ == "__main__":
    main()