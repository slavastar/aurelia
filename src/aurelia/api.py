"""FastAPI server for AURELIA Health Coach."""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import json
from datetime import datetime
import io

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

# Add CORS middleware to allow web client access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    # Ensure minimum age of 24 years
    weighted_age = max(24.0, weighted_age)
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
            
            # Debug: print first 500 chars of response
            print(f"AI Response (first 500 chars): {content[:500]}")
            
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
            import traceback
            error_trace = traceback.format_exc()
            print(f"ERROR parsing report: {error_trace}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse report: {str(parse_error)}"
            )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR in generate_report: {error_trace}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )


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
        
        return response.model_dump(mode='json')
        
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
