"""Simple direct test of the API functionality."""

from health_coach import HealthCoach
from schemas import HealthProfile, HealthReport, HealthReportWithMetadata
import json
from datetime import datetime

# Example profile
profile_data = {
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

print("Testing API logic directly...")
print("="*80)

# Create profile
profile = HealthProfile(**profile_data)
print(f"✓ Profile validated: {profile.age} years old, bioage {profile.bioage}")

# Initialize coach
coach = HealthCoach()
coach.set_health_profile(profile.model_dump())
print("✓ Health coach initialized")

# Generate report
print("\nGenerating report (this may take 1-2 minutes)...")
report_content = coach.generate_recommendations(format="json")

# Strip markdown if present
content = report_content.strip()
if content.startswith("```json"):
    content = content[7:]
if content.startswith("```"):
    content = content[3:]
if content.endswith("```"):
    content = content[:-3]
content = content.strip()

# Parse JSON
try:
    report_data = json.loads(content)
    print("✓ Report JSON parsed successfully")
    
    # Save raw JSON for inspection
    with open("raw_report.json", "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    print("✓ Raw JSON saved to raw_report.json")
    
    # Adapt model's creative JSON to our schema
    from json_adapter import adapt_model_json_to_schema
    adapted_data = adapt_model_json_to_schema(report_data)
    
    # Save adapted JSON
    with open("adapted_report.json", "w", encoding="utf-8") as f:
        json.dump(adapted_data, f, indent=2)
    print("✓ Adapted to schema format")
    
    # Validate with Pydantic
    health_report = HealthReport(**adapted_data)
    print("✓ Report validated with Pydantic models")
    
    # Create full response
    response = HealthReportWithMetadata(
        generated_at=datetime.now(),
        health_profile=profile,
        report=health_report
    )
    
    # Serialize
    output = response.model_dump(mode='json')
    
    # Save to file
    with open("direct_test_report.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    
    print("✓ Full report created with metadata")
    print(f"\n✓ Saved to: direct_test_report.json")
    print(f"\nReport summary:")
    print(f"  - Generated at: {output['generated_at']}")
    print(f"  - Bioage gap: {output['report']['health_assessment']['bioage_gap']} years")
    print(f"  - Recommendations: {len(output['report']['recommendations'])}")
    print(f"  - Supplements: {len(output['report']['supplement_protocol'])}")
    print(f"  - Biomarkers to retest: {len(output['report']['monitoring_plan']['retest_biomarkers'])}")
    
except json.JSONDecodeError as e:
    print(f"✗ JSON parsing failed: {str(e)}")
    print(f"\nFirst 200 chars of content:")
    print(content[:200])
except Exception as e:
    print(f"✗ Validation failed: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80)
print("Test complete!")
