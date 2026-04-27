# California Housing Price Predictor

A full-stack ML web app that predicts California median house prices using FastAPI (backend), Next.js (frontend), and a pre-trained Random Forest model.

## 🚀 Live Demo

Try the live app: https://house-price-predictor--manashdevbhatta.replit.app

## Clone Repository

```bash
git clone https://github.com/DSxManash/house-price-predictor.git
cd house-price-predictor
```

## Quick Start

### Backend (Terminal 1)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment Variables

**Backend** (`backend/.env`):
```
BACKEND_CORS_ORIGINS=http://localhost:3000
MAX_UPLOAD_SIZE_MB=10
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Features

- **Single Prediction**: Enter housing features to get price prediction
- **Batch Prediction**: Upload CSV file for multiple predictions
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile, tablet, and desktop

## API Endpoints

- `GET /health` - Health check
- `POST /predict` - Single prediction (JSON)
- `POST /batch_predict` - Batch prediction (CSV upload)

## Retrain Model

```bash
python ml/train_model.py
```

This reads from `data/data.csv` and updates the model in `artifacts/`.

## Project Structure

```
├── backend/          # FastAPI server
├── frontend/         # Next.js TypeScript app
├── ml/               # Model training script
├── data/             # California Housing dataset
└── artifacts/        # Pre-trained model files
```
