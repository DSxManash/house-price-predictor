import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_FILE = PROJECT_ROOT / "data" / "data.csv"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
MODEL_FILE = ARTIFACTS_DIR / "model.pkl"
PREPROCESSOR_FILE = ARTIFACTS_DIR / "preprocessor.pkl"


def build_pipeline(num_cols, cat_cols):
    numerical_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        [
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        [
            ("num", numerical_pipeline, num_cols),
            ("cat", categorical_pipeline, cat_cols),
        ]
    )

    return preprocessor


def train_and_save():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_FILE}")

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    housing = pd.read_csv(DATA_FILE)
    housing["income_cat"] = pd.cut(
        housing["median_income"],
        bins=[0.0, 1.5, 3.0, 4.5, 6.0, np.inf],
        labels=[1, 2, 3, 4, 5],
    )

    split = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    for train_index, _ in split.split(housing, housing["income_cat"]):
        housing = housing.loc[train_index].drop("income_cat", axis=1)

    housing_labels = housing["median_house_value"].copy()
    housing_features = housing.drop("median_house_value", axis=1)

    num_cols = housing_features.select_dtypes(include=["int64", "float64"]).columns.tolist()
    cat_cols = housing_features.select_dtypes(include=["object"]).columns.tolist()

    preprocessor = build_pipeline(num_cols, cat_cols)
    housing_prepared = preprocessor.fit_transform(housing_features)

    model = RandomForestRegressor(random_state=42)
    model.fit(housing_prepared, housing_labels)

    joblib.dump(model, MODEL_FILE)
    joblib.dump(preprocessor, PREPROCESSOR_FILE)

    print(f"Model saved to {MODEL_FILE}")
    print(f"Preprocessor saved to {PREPROCESSOR_FILE}")


if __name__ == "__main__":
    train_and_save()
