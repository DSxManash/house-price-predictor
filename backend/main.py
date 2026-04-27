from io import BytesIO
import os
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
MODEL_FILE = ARTIFACTS_DIR / "model.pkl"
PREPROCESSOR_FILE = ARTIFACTS_DIR / "preprocessor.pkl"
DEFAULT_LOCAL_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]
MAX_UPLOAD_SIZE_MB = float(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
MAX_UPLOAD_SIZE_BYTES = int(MAX_UPLOAD_SIZE_MB * 1024 * 1024)

FEATURE_COLUMNS = [
    "longitude",
    "latitude",
    "housing_median_age",
    "total_rooms",
    "total_bedrooms",
    "population",
    "households",
    "median_income",
    "ocean_proximity",
]

API_TO_MODEL_COLUMNS = {
    "longitude": "longitude",
    "latitude": "latitude",
    "housingMedianAge": "housing_median_age",
    "totalRooms": "total_rooms",
    "totalBedrooms": "total_bedrooms",
    "population": "population",
    "households": "households",
    "medianIncome": "median_income",
    "oceanProximity": "ocean_proximity",
}

MODEL_TO_API_COLUMNS = {
    value: key for key, value in API_TO_MODEL_COLUMNS.items()
}


class HousingInput(BaseModel):
    longitude: float
    latitude: float
    housingMedianAge: float = Field(..., ge=0)
    totalRooms: float = Field(..., ge=0)
    totalBedrooms: float = Field(..., ge=0)
    population: float = Field(..., ge=0)
    households: float = Field(..., ge=0)
    medianIncome: float = Field(..., ge=0)
    oceanProximity: str


def load_artifacts() -> tuple:
    if not MODEL_FILE.exists() or not PREPROCESSOR_FILE.exists():
        raise RuntimeError(
            "model.pkl and preprocessor.pkl must exist in the artifacts folder."
        )
    return joblib.load(MODEL_FILE), joblib.load(PREPROCESSOR_FILE)


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename_map = {}
    for col in df.columns:
        clean_col = col.strip()
        if clean_col in API_TO_MODEL_COLUMNS:
            rename_map[col] = API_TO_MODEL_COLUMNS[clean_col]
        elif clean_col in FEATURE_COLUMNS:
            rename_map[col] = clean_col

    normalized = df.rename(columns=rename_map)

    missing = [c for c in FEATURE_COLUMNS if c not in normalized.columns]
    if missing:
        raise ValueError(f"Missing required features: {missing}")

    return normalized[FEATURE_COLUMNS].copy()


model, preprocessor = load_artifacts()

app = FastAPI(title="California Housing Predictor", version="1.0.0")


def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv("BACKEND_CORS_ORIGINS", "")
    if not raw_origins.strip():
        return DEFAULT_LOCAL_ORIGINS

    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


allowed_origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: HousingInput) -> dict:
    try:
        input_dict = payload.model_dump()
        row = {API_TO_MODEL_COLUMNS[key]: value for key, value in input_dict.items()}
        input_df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

        transformed = preprocessor.transform(input_df)
        prediction = float(model.predict(transformed)[0])

        return {"medianHouseValue": prediction}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post("/batch_predict")
async def batch_predict(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    try:
        raw = await file.read()
        if len(raw) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"CSV file is too large. Max allowed size is {MAX_UPLOAD_SIZE_MB} MB."
                ),
            )

        df = pd.read_csv(BytesIO(raw))
        features_df = normalize_columns(df)

        transformed = preprocessor.transform(features_df)
        predictions = model.predict(transformed)

        output_df = features_df.rename(columns=MODEL_TO_API_COLUMNS)
        output_df["medianHouseValue"] = predictions

        output_buffer = BytesIO()
        output_df.to_csv(output_buffer, index=False)
        output_buffer.seek(0)

        return StreamingResponse(
            output_buffer,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=predictions.csv"
            },
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {exc}",
        ) from exc