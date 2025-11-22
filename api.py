"""FastAPI server for AURELIA Health Coach."""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any
import json
from datetime import datetime

from health_coach import HealthCoach
from schemas import (
    HealthProfile,
    HealthReport,
    HealthReportWithMetadata
)

app = FastAPI(
    title="AURELIA Health Coach API",
    description="AI-powered health optimization with evidence-based recommendations",
    version="1.0.0"
)


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
            
            from json_adapter import adapt_model_json_to_schema
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
