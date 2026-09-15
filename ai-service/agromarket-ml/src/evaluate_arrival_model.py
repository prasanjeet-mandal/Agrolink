import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

INPUT_FILE = "models/arrival_global/arrival_test_predictions.csv"

print("=" * 70)
print("ARRIVAL MODEL DIAGNOSTIC EVALUATION")
print("=" * 70)

df = pd.read_csv(INPUT_FILE)

actual = df["arrivals_tonnes"]
pred = df["predicted_arrivals_tonnes"]

# ---------------------------------------------------------
# OVERALL
# ---------------------------------------------------------

mae = mean_absolute_error(actual, pred)
rmse = np.sqrt(mean_squared_error(actual, pred))
r2 = r2_score(actual, pred)

print("\nOVERALL PERFORMANCE")
print("-" * 70)
print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R2   : {r2:.4f}")

# ---------------------------------------------------------
# PRODUCT-WISE
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("PRODUCT-WISE PERFORMANCE")
print("=" * 70)

product_results = []

for product, group in df.groupby("product"):

    y_true = group["arrivals_tonnes"]
    y_pred = group["predicted_arrivals_tonnes"]

    product_results.append({
        "product": product,
        "rows": len(group),
        "actual_mean": y_true.mean(),
        "predicted_mean": y_pred.mean(),
        "MAE": mean_absolute_error(y_true, y_pred),
        "RMSE": np.sqrt(mean_squared_error(y_true, y_pred)),
        "R2": r2_score(y_true, y_pred) if len(group) > 1 else np.nan
    })

product_results = pd.DataFrame(product_results)

print("\nBEST 15 PRODUCTS BY MAE")
print(
    product_results
    .sort_values("MAE")
    .head(15)
    .to_string(index=False)
)

print("\nWORST 15 PRODUCTS BY MAE")
print(
    product_results
    .sort_values("MAE", ascending=False)
    .head(15)
    .to_string(index=False)
)

# ---------------------------------------------------------
# STATE-WISE
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("STATE-WISE PERFORMANCE")
print("=" * 70)

state_results = []

for state, group in df.groupby("state"):

    y_true = group["arrivals_tonnes"]
    y_pred = group["predicted_arrivals_tonnes"]

    state_results.append({
        "state": state,
        "rows": len(group),
        "actual_mean": y_true.mean(),
        "predicted_mean": y_pred.mean(),
        "MAE": mean_absolute_error(y_true, y_pred),
        "RMSE": np.sqrt(mean_squared_error(y_true, y_pred)),
        "R2": r2_score(y_true, y_pred) if len(group) > 1 else np.nan
    })

state_results = pd.DataFrame(state_results)

print("\nBEST STATES BY MAE")
print(
    state_results
    .sort_values("MAE")
    .head(10)
    .to_string(index=False)
)

print("\nWORST STATES BY MAE")
print(
    state_results
    .sort_values("MAE", ascending=False)
    .head(10)
    .to_string(index=False)
)

# ---------------------------------------------------------
# DISTRICT-WISE
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("DISTRICT-WISE PERFORMANCE")
print("=" * 70)

district_results = []

for district, group in df.groupby("district"):

    y_true = group["arrivals_tonnes"]
    y_pred = group["predicted_arrivals_tonnes"]

    district_results.append({
        "district": district,
        "rows": len(group),
        "actual_mean": y_true.mean(),
        "predicted_mean": y_pred.mean(),
        "MAE": mean_absolute_error(y_true, y_pred),
        "RMSE": np.sqrt(mean_squared_error(y_true, y_pred)),
        "R2": r2_score(y_true, y_pred) if len(group) > 1 else np.nan
    })

district_results = pd.DataFrame(district_results)

print("\nBEST 15 DISTRICTS BY MAE")
print(
    district_results
    .sort_values("MAE")
    .head(15)
    .to_string(index=False)
)

print("\nWORST 15 DISTRICTS BY MAE")
print(
    district_results
    .sort_values("MAE", ascending=False)
    .head(15)
    .to_string(index=False)
)

# ---------------------------------------------------------
# IMPORTANT PRODUCTS
# ---------------------------------------------------------

important_products = [
    "Tomato",
    "Potato",
    "Onion",
    "Apple",
    "Rice",
    "Wheat"
]

print("\n" + "=" * 70)
print("IMPORTANT PRODUCT CHECK")
print("=" * 70)

for product in important_products:

    group = df[df["product"] == product]

    if len(group) == 0:
        print(f"\n{product}: NOT FOUND")
        continue

    y_true = group["arrivals_tonnes"]
    y_pred = group["predicted_arrivals_tonnes"]

    print(f"\n{product}")
    print(f"Rows          : {len(group)}")
    print(f"Actual mean   : {y_true.mean():.2f}")
    print(f"Predicted mean: {y_pred.mean():.2f}")
    print(f"MAE           : {mean_absolute_error(y_true, y_pred):.2f}")
    print(f"RMSE          : {np.sqrt(mean_squared_error(y_true, y_pred)):.2f}")
    print(
        f"R2            : "
        f"{r2_score(y_true, y_pred):.4f}"
    )

# ---------------------------------------------------------
# LARGE ERROR EXAMPLES
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("LARGEST PREDICTION ERRORS")
print("=" * 70)

df["absolute_error"] = (
    df["arrivals_tonnes"] -
    df["predicted_arrivals_tonnes"]
).abs()

print(
    df.sort_values(
        "absolute_error",
        ascending=False
    )
    [
        [
            "date",
            "product",
            "state",
            "district",
            "arrivals_tonnes",
            "predicted_arrivals_tonnes",
            "absolute_error"
        ]
    ]
    .head(20)
    .to_string(index=False)
)

# ---------------------------------------------------------
# SAVE REPORTS
# ---------------------------------------------------------

product_results.to_csv(
    "models/arrival_global/product_evaluation.csv",
    index=False
)

state_results.to_csv(
    "models/arrival_global/state_evaluation.csv",
    index=False
)

district_results.to_csv(
    "models/arrival_global/district_evaluation.csv",
    index=False
)

print("\n" + "=" * 70)
print("DIAGNOSTIC COMPLETE")
print("=" * 70)

print("Reports saved:")
print("product_evaluation.csv")
print("state_evaluation.csv")
print("district_evaluation.csv")

print("\nDONE!")
