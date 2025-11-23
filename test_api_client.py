"""
Simple test client for AURELIA Health Coach API.
Test the API endpoints with Emma's data.
"""

import requests
import json
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint."""
    print("=" * 80)
    print("Testing Health Check Endpoint")
    print("=" * 80)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()
    return response.json()


def test_generate_report():
    """Test the generate-report endpoint with Emma's data."""
    print("=" * 80)
    print("Testing Generate Report Endpoint (without photo)")
    print("=" * 80)
    
    # Emma's profile data
    profile = {
        "age": 30,
        "height": 170,
        "weight": 63,
        "bioage": 31.2,
        "lifestyle_quiz": {
            "name": "Emma",
            "sleep_duration": "7-8 hours",
            "stress_level": "2/5",
            "exercise_frequency": "3-4x per week",
            "diet_quality": "balanced"
        },
        "biomarkers": {
            # Glycemic panel
            "fasting_glucose": "5.2 mmol/L",
            "fasting_insulin": "8.5 µIU/mL",
            "HbA1c": "5.3 %",
            
            # Lipids
            "HDL_cholesterol": "1.7 mmol/L",
            "LDL_cholesterol": "2.8 mmol/L",
            "triglycerides": "0.9 mmol/L",
            "ApoB": "85 mg/dL",
            "ApoA1": "155 mg/dL",
            
            # Iron
            "ferritin": "35 µg/L",
            "iron": "60 µg/dL",
            
            # Inflammation
            "hscrp": "0.4 mg/L",
            "esr": "8 mm/h",
            "wbc": "6.5 x10^9/L",
            
            # Oxygen transport
            "hemoglobin": "13.2 g/dL",
            "hematocrit": "39 %",
            "rbc": "4.5 x10^12/L",
            
            # Vitamins
            "vitamin_d": "28 ng/mL",
            
            # Thyroid
            "tsh": "1.8 mIU/L"
        },
        "is_menstruating": True
    }
    
    print("Sending request...")
    response = requests.post(
        f"{BASE_URL}/generate-report",
        json=profile,
        timeout=300  # 5 minutes timeout for AI processing
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        
        # Save full report
        output_file = Path("client_test_report.json")
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
        print(f"✅ Full report saved to: {output_file}")
        
        # Display summary
        if "report" in result:
            report = result["report"]
            if "health_assessment" in report:
                assessment = report["health_assessment"]
                print(f"\n📊 Health Assessment:")
                print(f"   Status: {assessment.get('overall_health_status', 'N/A')[:100]}...")
                print(f"   Bioage Gap: {assessment.get('bioage_gap', 'N/A')} years")
                
            if "recommendations" in report:
                print(f"\n💊 Recommendations: {len(report['recommendations'])} items")
                for i, rec in enumerate(report['recommendations'][:3], 1):
                    print(f"   {i}. {rec.get('title', 'N/A')}")
        
        # Display scores
        if "health_profile" in result:
            profile = result["health_profile"]
            if profile.get("metabolic_score"):
                print(f"\n⚡ Metabolic Score: {profile['metabolic_score']['score']:.1f}/100 ({profile['metabolic_score']['level']})")
            if profile.get("inflammation_score"):
                print(f"🔥 Inflammation Score: {profile['inflammation_score']['score']:.1f}/100 ({profile['inflammation_score']['level']})")
            if profile.get("oxygen_score"):
                print(f"🫁 Oxygen Score: {profile['oxygen_score']['score']:.1f}/100 ({profile['oxygen_score']['level']})")
    else:
        print(f"❌ Error: {response.text}")
    
    print()
    return response


def test_generate_report_with_photo():
    """Test the generate-report-with-photo endpoint."""
    print("=" * 80)
    print("Testing Generate Report with Photo Endpoint")
    print("=" * 80)
    
    photo_path = Path("data/face2.jpeg")
    
    if not photo_path.exists():
        print(f"❌ Photo not found: {photo_path}")
        return None
    
    # Emma's profile data (same as above)
    profile = {
        "age": 30,
        "height": 170,
        "weight": 63,
        "bioage": 31.2,
        "lifestyle_quiz": {
            "name": "Emma",
            "sleep_duration": "7-8 hours",
            "stress_level": "2/5"
        },
        "biomarkers": {
            "fasting_glucose": "5.2 mmol/L",
            "fasting_insulin": "8.5 µIU/mL",
            "HbA1c": "5.3 %",
            "ferritin": "35 µg/L",
            "vitamin_d": "28 ng/mL"
        },
        "is_menstruating": True
    }
    
    print(f"Loading photo: {photo_path}")
    
    # Prepare multipart form data
    files = {
        'face_photo': ('face2.jpeg', open(photo_path, 'rb'), 'image/jpeg')
    }
    data = {
        'profile_json': json.dumps(profile)
    }
    
    print("Sending request with photo...")
    response = requests.post(
        f"{BASE_URL}/generate-report-with-photo",
        files=files,
        data=data,
        timeout=300
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        
        # Display skin age
        if "health_profile" in result and "skin_age" in result["health_profile"]:
            skin_age = result["health_profile"]["skin_age"]
            print(f"✅ Skin Age Estimated: {skin_age} years")
        
        print("✅ Report generated successfully")
    else:
        print(f"❌ Error: {response.text}")
    
    print()
    return response


if __name__ == "__main__":
    print("\n🏥 AURELIA Health Coach API Test Client\n")
    
    # Test 1: Health check
    try:
        health = test_health_check()
        if not health.get("api_key_configured"):
            print("⚠️  Warning: API key not configured. AI features may not work.")
            print()
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        print("Make sure the server is running on http://localhost:8000")
        exit(1)
    
    # Test 2: Generate report (simple)
    print("\n🔬 Test 1: Generating health report without photo...")
    print("⚠️  This will take 2-3 minutes as the AI researches recommendations...\n")
    
    try:
        response = test_generate_report()
        if response.status_code == 200:
            print("✅ Test 1 passed!")
        else:
            print("❌ Test 1 failed")
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    # Test 3: Generate report with photo (optional)
    # Uncomment to test:
    # print("\n📸 Test 2: Generating health report with photo...")
    # try:
    #     response = test_generate_report_with_photo()
    #     if response and response.status_code == 200:
    #         print("✅ Test 2 passed!")
    # except Exception as e:
    #     print(f"❌ Test failed: {e}")
    
    print("\n" + "=" * 80)
    print("🎉 API Testing Complete!")
    print("=" * 80)
    print(f"\n📖 View interactive API docs at: {BASE_URL}/docs")
    print(f"📊 Test report saved to: client_test_report.json")
