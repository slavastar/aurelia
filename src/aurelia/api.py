"""FastAPI server for AURELIA Health Coach."""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import json
from datetime import datetime
import io
import base64
import torch
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from torchvision import transforms
from torchvision import models
from pytorch_grad_cam import GradCAMPlusPlus

# Optional image processing imports
try:
    from PIL import Image
    import torch
    from transformers import ViTImageProcessor, ViTForImageClassification
    import torch.nn.functional as F
    IMAGE_PROCESSING_AVAILABLE = True
except ImportError:
    IMAGE_PROCESSING_AVAILABLE = False
    print("Warning: Image processing libraries not available. Face photo analysis disabled.")

from .health_coach import HealthCoach
from .schemas import (
    HealthProfile,
    HealthReport,
    HealthReportWithMetadata,
    MetabolicScoreResult,
    InflammationScoreResult,
    OxygenScoreResult
)
from .scoring.metabolic_scores import MetabolicScore
from .scoring.inflammation_scores import InflammationScore
from .scoring.oxygen_scores import OxygenScore
from .biomarker_reference import get_biomarkers_with_descriptions

app = FastAPI(
    title="AURELIA Health Coach API",
    description="AI-powered health optimization with evidence-based recommendations",
    version="1.0.0"
)

# Set device for models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load age prediction model at startup
if IMAGE_PROCESSING_AVAILABLE:
    try:
        print("Loading age prediction model...")
        model_name = "nateraw/vit-age-classifier"
        processor = ViTImageProcessor.from_pretrained(model_name)
        age_model = ViTForImageClassification.from_pretrained(model_name)
        print(f"Age prediction model loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not load age prediction model: {e}")
        IMAGE_PROCESSING_AVAILABLE = False
else:
    processor = None
    age_model = None

# Load GradCAM age regression model
gradcam_model = None
if IMAGE_PROCESSING_AVAILABLE:
    try:
        print("Loading GradCAM age regression model...")
        import os
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "age_regression_model.pth")
        
        # Initialize ResNet18 architecture for age regression
        gradcam_model = models.resnet18(weights=None)
        # Modify final layer for regression (single output)
        gradcam_model.fc = torch.nn.Linear(gradcam_model.fc.in_features, 1)
        
        # Load trained weights
        gradcam_model.load_state_dict(torch.load(model_path, map_location=device))
        gradcam_model = gradcam_model.to(device)
        gradcam_model.eval()
        print(f"GradCAM age regression model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Warning: Could not load GradCAM age regression model: {e}")
        gradcam_model = None


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


def predict_skin_age(image) -> float:
    """Predict skin age from face photo."""
    if not IMAGE_PROCESSING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Image processing not available")
    
    image = image.convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    
    with torch.no_grad():
        outputs = age_model(**inputs)
        logits = outputs.logits
    
    probs = F.softmax(logits, dim=-1)[0]
    
    # Get all age ranges and their probabilities
    age_ranges = []
    for idx, prob in enumerate(probs):
        age_label = age_model.config.id2label[idx]
        min_age, max_age = parse_age_range(age_label)
        age_ranges.append({
            'mid': (min_age + max_age) / 2,
            'prob': prob.item()
        })
    
    # Calculate weighted average
    weighted_age = sum(r['mid'] * r['prob'] for r in age_ranges)
    return round(weighted_age, 1)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "AURELIA Health Coach API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.post("/generate-report", response_model=Dict[str, Any])
async def generate_report(profile: HealthProfile):
    """
    Generate a comprehensive health optimization report.
    
    Args:
        profile: User's health profile with biomarkers and lifestyle data
        
    Returns:
        Complete health report with recommendations, supplement protocol,
        and monitoring plan
    """
    try:
        # Enrich biomarkers with descriptions (only for present biomarkers)
        enriched_biomarkers = get_biomarkers_with_descriptions(profile.biomarkers)
        profile.biomarkers_with_descriptions = enriched_biomarkers
        
        # Compute metabolic score if biomarkers available
        metabolic_result = MetabolicScore.compute_metabolic_score(profile.biomarkers)
        if metabolic_result:
            profile.metabolic_score = MetabolicScoreResult(**metabolic_result)
            print(f"Metabolic efficiency score: {metabolic_result['score']} ({metabolic_result['level']})")
        
        # Compute inflammation score if biomarkers available
        if profile.is_menstruating is not None:
            inflammation_result = InflammationScore.compute_inflammation_score(
                profile.biomarkers,
                is_menstruating=profile.is_menstruating
            )
            if inflammation_result:
                profile.inflammation_score = InflammationScoreResult(**inflammation_result)
                print(f"Inflammation/recovery score: {inflammation_result['score']} ({inflammation_result['level']})")
        
        # Compute oxygen transport score if biomarkers available
        oxygen_result = OxygenScore.compute_oxygen_score(profile.biomarkers)
        if oxygen_result:
            profile.oxygen_score = OxygenScoreResult(**oxygen_result)
            print(f"Oxygen transport score: {oxygen_result['score']} ({oxygen_result['level']})")
        
        # Initialize health coach
        coach = HealthCoach()
        
        # Set health profile
        coach.set_health_profile(profile.model_dump())
        
        # Generate recommendations in JSON format
        report_content = coach.generate_recommendations(format="json")
        
        # Parse and validate the report
        try:
            # Strip markdown code blocks if present
            content = report_content.strip()
            if content.startswith("```json"):
                content = content[7:]  # Remove ```json
            if content.startswith("```"):
                content = content[3:]   # Remove ```
            if content.endswith("```"):
                content = content[:-3]  # Remove trailing ```
            content = content.strip()
            
            # Parse JSON and adapt to schema
            report_data = json.loads(content)
            
            from .json_adapter import adapt_model_json_to_schema
            adapted_data = adapt_model_json_to_schema(report_data)
            
            health_report = HealthReport(**adapted_data)
            
            # Create response with metadata
            response = HealthReportWithMetadata(
                generated_at=datetime.now(),
                health_profile=profile,
                report=health_report
            )
            
            return response.model_dump(mode='json')
            
        except json.JSONDecodeError:
            # If model returns text instead of JSON, return as text response
            return {
                "error": "Report generated in text format instead of JSON",
                "text_content": report_content
            }
        except Exception as parse_error:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse report: {str(parse_error)}"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )

    
def overlay_pil_images(img1, img2, alpha=0.5):
    """
    Returns a PIL image that is a blend of img1 and img2.
    img1 and img2 must both be RGB and the same size.
    alpha = 0.0 → only img1
    alpha = 1.0 → only img2
    """
    img1 = img1.convert("RGBA")
    img2 = img2.convert("RGBA")
    return Image.blend(img1, img2, alpha).convert("RGB")


def predict_with_gradcam(model, pil_image, device):
    # Force RGB mode for consistency
    pil_image = pil_image.convert("RGB")
    orig_w, orig_h = pil_image.size   # <-- store original size

    # ---------- SAME SPATIAL TRANSFORM AS TRAINING ----------
    resize_224 = transforms.Resize((224, 224))

    # Model input transform (same as training)
    input_transform = transforms.Compose([
        resize_224,
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    # Visualization image (normalized for GradCAM overlay)
    vis_224_pil = resize_224(pil_image)
    vis_224_np = np.array(vis_224_pil).astype(np.float32) / 255.0  # RGB float32 [0,1]

    # Prepare model tensor
    input_tensor = input_transform(pil_image).unsqueeze(0).to(device)

    # ---------- PREDICTION ----------
    model.eval()
    with torch.no_grad():
        predicted_age = float(model(input_tensor).cpu().numpy()[0][0])

    # ---------- GRAD-CAM++ ----------
    target_layers = [model.layer4[-1]]
    cam = GradCAMPlusPlus(model=model, target_layers=target_layers)

    grayscale_cam = cam(input_tensor=input_tensor)[0]  # shape: (224,224)

    # ----- APPLY COLOR MAP (jet) -----
    colored_cam_224 = plt.get_cmap("jet")(grayscale_cam)[..., :3]  # float 0–1, shape (224,224,3)

    # Convert to uint8 image
    cam_pil_224 = Image.fromarray((colored_cam_224 * 255).astype(np.uint8))

    # ---------- UPSCALE GRADCAM BACK TO ORIGINAL SIZE ----------
    cam_pil = cam_pil_224.resize((orig_w, orig_h), Image.BILINEAR)

    # ---------- ALSO UPSCALE VISUALIZATION IMAGE ----------
    vis_pil = vis_224_pil.resize((orig_w, orig_h), Image.BILINEAR)

    return predicted_age, cam_pil, vis_pil


@app.post("/generate-report-with-photo", response_model=Dict[str, Any])
async def generate_report_with_photo(
    profile_json: str = Form(...),
    face_photo: UploadFile = File(...)
):
    """
    Generate health report with facial age analysis.
    
    Args:
        profile_json: JSON string of health profile
        face_photo: Face photo for skin age estimation
    """
    try:
        # Parse profile
        profile_data = json.loads(profile_json)
        profile = HealthProfile(**profile_data)
        
        # Enrich biomarkers with descriptions (only for present biomarkers)
        enriched_biomarkers = get_biomarkers_with_descriptions(profile.biomarkers)
        profile.biomarkers_with_descriptions = enriched_biomarkers
        
        # Compute metabolic score if biomarkers available
        metabolic_result = MetabolicScore.compute_metabolic_score(profile.biomarkers)
        if metabolic_result:
            profile.metabolic_score = MetabolicScoreResult(**metabolic_result)
            print(f"Metabolic efficiency score: {metabolic_result['score']} ({metabolic_result['level']})")
        
        # Compute inflammation score if biomarkers available
        if profile.is_menstruating is not None:
            inflammation_result = InflammationScore.compute_inflammation_score(
                profile.biomarkers,
                is_menstruating=profile.is_menstruating
            )
            if inflammation_result:
                profile.inflammation_score = InflammationScoreResult(**inflammation_result)
                print(f"Inflammation/recovery score: {inflammation_result['score']} ({inflammation_result['level']})")
        
        # Compute oxygen transport score if biomarkers available
        oxygen_result = OxygenScore.compute_oxygen_score(profile.biomarkers)
        if oxygen_result:
            profile.oxygen_score = OxygenScoreResult(**oxygen_result)
            print(f"Oxygen transport score: {oxygen_result['score']} ({oxygen_result['level']})")
        
        # Process face photo
        if not face_photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Must be an image file")
        
        try:
            contents = await face_photo.read()
            if IMAGE_PROCESSING_AVAILABLE:
                image = Image.open(io.BytesIO(contents))
                skin_age = predict_skin_age(image)
                _, cam_pil, vis_pil = predict_with_gradcam(gradcam_model, image, device)
                feature_image = overlay_pil_images(vis_pil, cam_pil, alpha=0.35)
                profile.skin_age = skin_age
                print(f"Estimated skin age: {skin_age} years")
            else:
                raise HTTPException(status_code=503, detail="Image processing unavailable")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing image: {e}")
        
        # Generate report
        coach = HealthCoach()
        coach.set_health_profile(profile.model_dump())
        report_content = coach.generate_recommendations(format="json")
        
        # Parse and validate
        content = report_content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        report_data = json.loads(content)
        from .json_adapter import adapt_model_json_to_schema
        
        # Debug: save raw report
        with open("debug_raw_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        try:
            adapted_data = adapt_model_json_to_schema(report_data)
        except Exception as adapt_error:
            print(f"Adapter error: {adapt_error}")
            print(f"Report data type: {type(report_data)}")
            print(f"Report data keys: {report_data.keys() if isinstance(report_data, dict) else 'Not a dict'}")
            raise HTTPException(status_code=500, detail=f"Adapter error: {adapt_error}")
        
        health_report = HealthReport(**adapted_data)
        
        response = HealthReportWithMetadata(
            generated_at=datetime.now(),
            health_profile=profile,
            report=health_report
        )
        
        # Convert feature_image to base64 for JSON response
        buffered = io.BytesIO()
        feature_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Add feature_image to response
        response_dict = response.model_dump(mode='json')
        response_dict['feature_image_base64'] = img_str
        
        return response_dict
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parsing error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@app.post("/generate-report-simple", response_model=Dict[str, str])
async def generate_report_simple(profile: HealthProfile):
    """
    Generate a simple text-format health report.
    
    Args:
        profile: User's health profile
        
    Returns:
        Text-format health optimization report
    """
    try:
        coach = HealthCoach()
        coach.set_health_profile(profile.model_dump())
        
        report_content = coach.generate_recommendations(format="text")
        
        return {
            "report": report_content,
            "format": "text"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Detailed health check with API key validation."""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    api_key = os.getenv("NET_MIND_API_KEY")
    
    return {
        "status": "healthy",
        "api_key_configured": bool(api_key),
        "services": {
            "ai_model": "moonshotai/Kimi-K2-Instruct",
            "search": "DuckDuckGo",
            "reddit": "Reddit JSON API"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
