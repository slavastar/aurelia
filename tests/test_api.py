"""Example requests for testing the API."""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

# Example health profile
example_profile = {
    "age": 35,
    "height": 175,
    "weight": 78,
    "bioage": 38.5,
    "lifestyle_quiz": {
        "sleep_hours": "6-7 hours",
        "exercise_frequency": "2-3 times per week",
        "stress_level": "moderate to high",
        "diet_type": "mixed, some processed foods",
        "alcohol_consumption": "1-2 drinks per week",
        "smoking": "no",
        "water_intake": "4-6 glasses per day"
    },
    "biomarkers": {
        "fasting_glucose": "102 mg/dL",
        "HbA1c": "5.8%",
        "total_cholesterol": "220 mg/dL",
        "LDL_cholesterol": "145 mg/dL",
        "HDL_cholesterol": "45 mg/dL",
        "triglycerides": "180 mg/dL",
        "vitamin_D": "22 ng/mL",
        "TSH": "2.8 mIU/L",
        "CRP": "3.2 mg/L"
    }
}


def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()


def test_generate_report():
    """Test report generation with JSON format."""
    print("Generating health report (JSON format)...")
    print("This will take 1-3 minutes as the AI researches your health profile...")
    
    response = requests.post(
        f"{BASE_URL}/generate-report",
        json=example_profile,
        timeout=300  # 5 minute timeout for research
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        report = response.json()
        
        # Save to file
        with open("api_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        
        print("✓ Report generated successfully!")
        print(f"✓ Saved to: api_test_report.json")
        print(f"\nReport summary:")
        print(f"  - Generated at: {report.get('generated_at')}")
        print(f"  - Bioage gap: {report['report']['health_assessment']['bioage_gap']} years")
        print(f"  - Recommendations: {len(report['report']['recommendations'])}")
        print(f"  - Supplements: {len(report['report']['supplement_protocol'])}")
    else:
        print(f"Error: {response.text}")
    print()


def test_generate_report_simple():
    """Test simple text format report generation."""
    print("Generating simple text report...")
    
    response = requests.post(
        f"{BASE_URL}/generate-report-simple",
        json=example_profile,
        timeout=300
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        report = response.json()
        
        # Save to file
        with open("api_test_report.txt", "w", encoding="utf-8") as f:
            f.write(report["report"])
        
        print("✓ Report generated successfully!")
        print(f"✓ Saved to: api_test_report.txt")
        print(f"✓ Format: {report['format']}")
    else:
        print(f"Error: {response.text}")
    print()


if __name__ == "__main__":
    print("="*80)
    print("AURELIA Health Coach API - Test Suite")
    print("="*80)
    print()
    
    # Test health check
    try:
        test_health_check()
    except requests.exceptions.ConnectionError:
        print("❌ Error: API server not running!")
        print("Start the server with: uvicorn api:app --reload")
        exit(1)
    
    # Ask which test to run
    print("Select test:")
    print("1. Generate JSON report (comprehensive)")
    print("2. Generate text report (simple)")
    print("3. Both")
    
    choice = input("\nEnter choice (1-3): ").strip()
    print()
    
    try:
        if choice in ["1", "3"]:
            test_generate_report()
        
        if choice in ["2", "3"]:
            test_generate_report_simple()
    
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The AI may be doing extensive research.")
        print("Try again or increase the timeout.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
