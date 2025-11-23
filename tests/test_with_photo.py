"""Test health report generation with face photo."""

import requests
import json

# Test profile
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

print("Testing health report with face photo analysis")
print("=" * 80)

# Test WITH face photo
print("\nSending request with face photo...")
with open("data/face.jpg", "rb") as f:
    files = {'face_photo': ('face.jpg', f, 'image/jpeg')}
    data = {'profile_json': json.dumps(profile_data)}
    
    response = requests.post(
        "http://localhost:8000/generate-report-with-photo",
        files=files,
        data=data,
        timeout=300
    )

print(f"Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print("\n✓ Report generated successfully!")
    print(f"\nAge Analysis:")
    print(f"  - Chronological age: {result['health_profile']['age']} years")
    print(f"  - Biological age (biomarkers): {result['health_profile']['bioage']} years")
    print(f"  - Skin age (facial analysis): {result['health_profile'].get('skin_age', 'N/A')} years")
    
    bioage_gap = result['health_profile']['bioage'] - result['health_profile']['age']
    if result['health_profile'].get('skin_age'):
        skin_gap = result['health_profile']['skin_age'] - result['health_profile']['age']
        print(f"\nAge Gaps:")
        print(f"  - Bioage gap: {bioage_gap:+.1f} years")
        print(f"  - Skin age gap: {skin_gap:+.1f} years")
    
    print(f"\nReport Details:")
    print(f"  - Generated at: {result['generated_at']}")
    print(f"  - Recommendations: {len(result['report']['recommendations'])}")
    print(f"  - Supplements: {len(result['report']['supplement_protocol'])}")
    
    # Save report
    with open("photo_test_report.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"\n✓ Full report saved to: photo_test_report.json")
    
else:
    print(f"\n✗ Error: {response.status_code}")
    print(response.text)

print("\n" + "=" * 80)
