"""Test skin age integration with health report."""

import requests
import json

# Test profile data
profile_data = {
    "age": 35,
    "height": 175,
    "weight": 78,
    "bioage": 38.5,
    "lifestyle_quiz": {
        "exercise_frequency": "2-3x per week",
        "sleep_hours": "6-7 hours",
        "stress_level": "moderate to high",
        "diet_type": "mixed diet with some processed foods"
    },
    "biomarkers": {
        "fasting_glucose": "102 mg/dL",
        "HbA1c": "5.8%",
        "total_cholesterol": "220 mg/dL",
        "LDL_cholesterol": "145 mg/dL",
        "HDL_cholesterol": "45 mg/dL",
        "triglycerides": "180 mg/dL",
        "vitamin_D": "22 ng/mL",
        "CRP": "3.2 mg/L",
        "TSH": "2.8 mIU/L"
    }
}

print("Testing health report generation with optional skin age...")
print("=" * 80)

# Test without face photo
print("\n1. Testing WITHOUT face photo:")
response = requests.post(
    "http://localhost:8000/generate-report",
    json=profile_data,
    timeout=300
)

if response.status_code == 200:
    result = response.json()
    print(f"✓ Report generated successfully")
    print(f"  - Skin age: {result['health_profile'].get('skin_age', 'Not provided')}")
    print(f"  - Bioage: {result['health_profile']['bioage']}")
else:
    print(f"✗ Error: {response.status_code}")
    print(response.text)

print("\n" + "=" * 80)
print("Note: To test WITH face photo, provide a face image file")
print("Example:")
print("  files = {'face_photo': open('face.jpg', 'rb')}")
print("  data = {'profile': json.dumps(profile_data)}")
print("  response = requests.post(url, data=data, files=files)")
