from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import torch
from transformers import ViTImageProcessor, ViTForImageClassification
import torch.nn.functional as F
import io
from typing import Dict, List
import uvicorn

app = FastAPI(title="Age Prediction API", version="1.0.0")

# Load model at startup
print("Loading age prediction model...")
model_name = "nateraw/vit-age-classifier"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)
print(f"Model loaded successfully. Classes: {model.config.id2label}")


def parse_age_range(age_label: str) -> tuple:
    """Parse age range label to get min and max ages."""
    if age_label == "more than 70":
        return 70, 85
    elif "-" in age_label:
        parts = age_label.split("-")
        return int(parts[0]), int(parts[1])
    else:
        age = int(age_label)
        return age, age


def predict_age_from_image(image: Image.Image, return_distribution: bool = False):
    """
    Predict precise age from PIL Image.
    
    Args:
        image: PIL Image object
        return_distribution: If True, also return probability distribution
    
    Returns:
        Precise age estimate (int), or dict with age and distribution
    """
    # Ensure RGB format
    image = image.convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
    
    # Convert logits to probabilities
    probs = F.softmax(logits, dim=-1)[0]
    
    # Get all age ranges and their probabilities
    age_ranges = []
    for idx, prob in enumerate(probs):
        age_label = model.config.id2label[idx]
        min_age, max_age = parse_age_range(age_label)
        age_ranges.append({
            'idx': idx,
            'label': age_label,
            'min': min_age,
            'max': max_age,
            'mid': (min_age + max_age) / 2,
            'prob': prob.item()
        })
    
    # Sort by probability
    age_ranges_sorted = sorted(age_ranges, key=lambda x: x['prob'], reverse=True)
    
    # Get top prediction
    top_range = age_ranges_sorted[0]
    
    # Calculate position within the top range based on second prediction
    if len(age_ranges_sorted) > 1:
        second_range = age_ranges_sorted[1]
        
        # If second highest is older, shift towards upper bound
        if second_range['mid'] > top_range['mid']:
            position = 0.5 + 0.4 * (second_range['prob'] / top_range['prob'])
        # If second highest is younger, shift towards lower bound
        elif second_range['mid'] < top_range['mid']:
            position = 0.5 - 0.4 * (second_range['prob'] / top_range['prob'])
        else:
            position = 0.5
        
        # Clamp position between 0 and 1 to ensure we stay within range
        position = max(0, min(1, position))
    else:
        # Only one prediction, use midpoint
        position = 0.5
    
    # Calculate age within the top range only
    precise_age = top_range['min'] + position * (top_range['max'] - top_range['min'])
    
    # Round to integer
    precise_age = round(precise_age)
    
    if return_distribution:
        # Format distribution for API response
        distribution = [
            {
                'age_range': r['label'],
                'probability': round(r['prob'] * 100, 2)
            }
            for r in age_ranges_sorted[:5]  # Top 5 predictions
        ]
        return {
            'predicted_age': precise_age,
            'top_age_group': top_range['label'],
            'confidence': round(top_range['prob'] * 100, 2),
            'distribution': distribution
        }
    
    return {'predicted_age': precise_age}


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Age Prediction API",
        "model": model_name
    }


@app.post("/predict-age")
async def predict_age(
    file: UploadFile = File(...),
    include_distribution: bool = False
):
    """
    Predict age from an uploaded face image.
    
    Args:
        file: Image file (JPEG, PNG, etc.)
        include_distribution: Whether to include probability distribution in response
    
    Returns:
        JSON with predicted age and optional distribution
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, etc.)"
        )
    
    try:
        # Read image from upload
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Predict age
        result = predict_age_from_image(image, return_distribution=include_distribution)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
