# Backend - Age Prediction API

FastAPI-based REST API for predicting age from facial images using a Vision Transformer model.

## Features

- **Age Prediction**: Precise age estimation from face images
- **Smart Algorithm**: Uses probability distribution across age groups for accurate predictions
- **REST API**: Simple HTTP endpoints for easy integration
- **Auto-reload**: Development server with hot-reload support

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn (web framework and server)
- PyTorch and Transformers (ML models)
- PIL/Pillow (image processing)
- Other required dependencies

### 3. Download Model

The age prediction model (`nateraw/vit-age-classifier`) will be automatically downloaded on first run.

## Running the Server

### Development Mode (with auto-reload)

```bash
source venv/bin/activate
venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
source venv/bin/activate
venv/bin/python app.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check

```bash
GET http://localhost:8000/
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Age Prediction API",
  "model": "nateraw/vit-age-classifier"
}
```

### Predict Age

```bash
POST http://localhost:8000/predict-age
```

**Parameters:**
- `file`: Image file (required) - JPEG, PNG, etc.
- `include_distribution`: Boolean (optional, default: false) - Include probability distribution

## Usage Examples

### Simple Age Prediction

```bash
curl -X POST "http://localhost:8000/predict-age" \
  -F "file=@face.jpg"
```

**Response:**
```json
{
  "predicted_age": 27
}
```

### With Probability Distribution

```bash
curl -X POST "http://localhost:8000/predict-age?include_distribution=true" \
  -F "file=@face.jpg"
```

**Response:**
```json
{
  "predicted_age": 27,
  "top_age_group": "20-29",
  "confidence": 59.91,
  "distribution": [
    {"age_range": "20-29", "probability": 59.91},
    {"age_range": "30-39", "probability": 36.48},
    {"age_range": "40-49", "probability": 2.07},
    {"age_range": "10-19", "probability": 1.47},
    {"age_range": "50-59", "probability": 0.04}
  ]
}
```

### Using Python

```python
import requests

# Simple prediction
with open('face.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/predict-age',
        files={'file': f}
    )
    result = response.json()
    print(f"Predicted age: {result['predicted_age']}")

# With distribution
with open('face.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/predict-age',
        files={'file': f},
        params={'include_distribution': True}
    )
    result = response.json()
    print(f"Predicted age: {result['predicted_age']}")
    print(f"Confidence: {result['confidence']}%")
```

## How Age Prediction Works

The API uses a sophisticated algorithm that:

1. **Classifies into age groups**: Uses a Vision Transformer model to predict age ranges (0-2, 3-9, 10-19, 20-29, etc.)
2. **Analyzes probability distribution**: Examines confidence scores across all age groups
3. **Smart positioning**: Uses the second-highest probability to determine position within the predicted range
   - If 2nd highest is older → shifts toward upper bound
   - If 2nd highest is younger → shifts toward lower bound
4. **Returns integer age**: Final result is rounded to nearest whole number

**Example**: If predicted as 30-39 (60%) with 40-49 as second (25%), the estimate will be closer to 39 rather than the midpoint (34.5).

## Project Structure

```
backend/
├── app.py              # FastAPI server
├── predict_age.py      # Standalone age prediction script
├── generator.py        # Synthetic data generator
├── prompt.md          # LLM prompt for data generation
├── config.yaml        # Configuration for data generation
├── requirements.txt   # Python dependencies
├── README.md          # This file
└── venv/             # Virtual environment (not in git)
```

## Troubleshooting

### ModuleNotFoundError: No module named 'torch'

Make sure you're using the virtual environment's Python:
```bash
source venv/bin/activate
venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Port already in use

Change the port number:
```bash
venv/bin/uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### Model download fails

Ensure you have internet connection. The model (~300MB) will be cached in `~/.cache/huggingface/`.

## License

MIT
