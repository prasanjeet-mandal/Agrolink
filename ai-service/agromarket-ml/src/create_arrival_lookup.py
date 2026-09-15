import pandas as pd

INPUT = r"data\demand\processed\arrival_district_features_120.csv"
OUTPUT = r"data\demand\processed\arrival_inference_lookup_120.csv"

cols = [
    "date",
    "product",
    "state",
    "district",
    "arrivals_tonnes",
    "arrival_lag_1",
    "arrival_lag_7",
    "arrival_lag_14",
    "arrival_lag_30",
    "arrival_rolling_mean_7",
    "arrival_rolling_mean_14",
    "arrival_rolling_mean_30",
    "arrival_rolling_std_7",
    "arrival_rolling_std_30",
]

latest = {}

for chunk in pd.read_csv(
    INPUT,
    usecols=cols,
    parse_dates=["date"],
    chunksize=300000
):
    chunk = chunk.sort_values("date")

    for row in chunk.itertuples(index=False):
        key = (row.product, row.state, row.district)

        if key not in latest or row.date > latest[key].date:
            latest[key] = row

result = pd.DataFrame(
    list(latest.values()),
    columns=cols
)

result.to_csv(OUTPUT, index=False)

print("Created:", OUTPUT)
print("Rows:", len(result))
