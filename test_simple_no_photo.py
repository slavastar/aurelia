"""Simple test without face photo first."""
import requests
import json

profile_data = {
    "age": 35,
    "height": 175,
    "weight": 78,
    "bioage": 38.5,
    "lifestyle_quiz": {
        "exercise_frequency": "2-3x per week",
        "sleep_hours": "6-7 hours",
        "stress_level": "moderate to high",
        "diet_type": "mixed diet"
    },
    "biomarkers": {
        "fasting_glucose": "102 mg/dL",
        "HbA1c": "5.8%",
        "vitamin_D": "22 ng/mL"
    }
}

print("Testing simple report generation (no photo)...")
response = requests.post(
    "http://localhost:8000/generate-report",
    json=profile_data,
    timeout=300
)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"✓ Success! Bioage: {result['health_profile']['bioage']}")
    print(f"  Skin age: {result['health_profile'].get('skin_age', 'Not provided')}")
else:
    print(f"✗ Error: {response.text}")
