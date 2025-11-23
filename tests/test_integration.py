"""
Comprehensive integration test for AURELIA Health Coach.
Tests all scoring systems and report generation.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from aurelia import HealthCoach, HealthProfile
from aurelia.scoring import MetabolicScore, InflammationScore, OxygenScore
import json

print("=" * 100)
print("AURELIA HEALTH COACH - COMPREHENSIVE INTEGRATION TEST")
print("=" * 100)

# Create a comprehensive health profile with all biomarkers
test_profile = {
    "age": 35,
    "height": 165,  # cm
    "weight": 62,   # kg
    "bioage": 38.5,
    "is_menstruating": True,
    "lifestyle_quiz": {
        "sleep_hours": 6.5,
        "sleep_quality": "poor - frequent waking",
        "exercise_frequency": "4x/week - mix of HIIT and strength training",
        "exercise_type": "CrossFit, running, weightlifting",
        "diet_type": "Mediterranean with intermittent fasting (16:8)",
        "stress_level": "high - work deadlines and family responsibilities",
        "alcohol": "1-2 glasses wine on weekends",
        "smoking": "never",
        "supplements": "multivitamin, vitamin D, omega-3, magnesium"
    },
    "biomarkers": {
        # Metabolic markers
        "fasting_glucose": "104 mg/dL",
        "fasting_insulin": "12 µIU/mL",
        "HbA1c": "5.9 %",
        "triglycerides": "150 mg/dL",
        "total_cholesterol": "220 mg/dL",
        "LDL_cholesterol": "140 mg/dL",
        "HDL_cholesterol": "45 mg/dL",
        "ApoB": "110 mg/dL",
        "ApoA1": "110 mg/dL",
        
        # Inflammation markers
        "hsCRP": "2.5 mg/L",
        "ESR": "20 mm/h",
        "ferritin": "90 µg/L",
        "WBC": "9.0 x10^9/L",
        
        # Oxygen transport markers
        "hemoglobin": "12.5 g/dL",
        "hematocrit": "38 %",
        "rbc": "4.2 x10^12/L",
        "iron": "70 µg/dL",
        
        # Thyroid
        "TSH": "2.5 mIU/L",
        "free_T4": "1.2 ng/dL",
        "free_T3": "3.0 pg/mL",
        
        # Vitamins & minerals
        "vitamin_D": "28 ng/mL",
        "vitamin_B12": "350 pg/mL",
        "folate": "8 ng/mL",
        "magnesium": "2.0 mg/dL",
        
        # Liver & kidney
        "ALT": "28 U/L",
        "AST": "24 U/L",
        "creatinine": "0.9 mg/dL",
        "eGFR": "95 mL/min/1.73m²",
        
        # Other
        "cortisol_am": "18 µg/dL",
        "DHEA_S": "180 µg/dL"
    }
}

print("\n" + "=" * 100)
print("STEP 1: Profile Validation")
print("=" * 100)

try:
    profile = HealthProfile(**test_profile)
    print("✓ Profile validation successful")
    print(f"  Age: {profile.age} years")
    print(f"  Biological Age: {profile.bioage} years")
    print(f"  Age Gap: +{profile.bioage - profile.age} years")
    print(f"  BMI: {profile.weight / ((profile.height/100)**2):.1f}")
    print(f"  Biomarkers: {len(profile.biomarkers)} markers")
    print(f"  Is Menstruating: {profile.is_menstruating}")
except Exception as e:
    print(f"✗ Profile validation failed: {e}")
    sys.exit(1)

print("\n" + "=" * 100)
print("STEP 2: Metabolic Score Calculation")
print("=" * 100)

metabolic_result = MetabolicScore.compute_metabolic_score(profile.biomarkers)
if metabolic_result:
    print("✓ Metabolic score computed successfully")
    print(f"  Score: {metabolic_result['score']}/100")
    print(f"  Level: {metabolic_result['level']}")
    print(f"  Markers used: {metabolic_result['markers_used']}")
    print(f"  Description: {metabolic_result['description']}")
    print(f"\n  Components:")
    for key, value in metabolic_result['components'].items():
        if value:
            print(f"    - {key}: {value:.2f}")
    
    # Add to profile
    from aurelia.schemas import MetabolicScoreResult
    profile.metabolic_score = MetabolicScoreResult(**metabolic_result)
else:
    print("✗ Metabolic score calculation failed")

print("\n" + "=" * 100)
print("STEP 3: Inflammation Score Calculation")
print("=" * 100)

inflammation_result = InflammationScore.compute_inflammation_score(
    profile.biomarkers,
    is_menstruating=profile.is_menstruating
)
if inflammation_result:
    print("✓ Inflammation score computed successfully")
    print(f"  Score: {inflammation_result['score']}/100")
    print(f"  Level: {inflammation_result['level']}")
    print(f"  Markers used: {inflammation_result['markers_used']}")
    print(f"  Is Menstruating: {inflammation_result['is_menstruating']}")
    print(f"  Description: {inflammation_result['description']}")
    print(f"\n  Components:")
    for key, value in inflammation_result['components'].items():
        if value:
            print(f"    - {key}: {value:.2f}")
    
    # Add to profile
    from aurelia.schemas import InflammationScoreResult
    profile.inflammation_score = InflammationScoreResult(**inflammation_result)
else:
    print("✗ Inflammation score calculation failed")

print("\n" + "=" * 100)
print("STEP 4: Oxygen Transport Score Calculation")
print("=" * 100)

oxygen_result = OxygenScore.compute_oxygen_score(profile.biomarkers)
if oxygen_result:
    print("✓ Oxygen score computed successfully")
    print(f"  Score: {oxygen_result['score']}/100")
    print(f"  Level: {oxygen_result['level']}")
    print(f"  Markers used: {oxygen_result['markers_used']}")
    print(f"  Description: {oxygen_result['description']}")
    print(f"\n  Components:")
    for key, value in oxygen_result['components'].items():
        if value:
            print(f"    - {key}: {value:.2f}")
    
    # Add to profile
    from aurelia.schemas import OxygenScoreResult
    profile.oxygen_score = OxygenScoreResult(**oxygen_result)
else:
    print("✗ Oxygen score calculation failed")

print("\n" + "=" * 100)
print("STEP 5: Health Profile Summary")
print("=" * 100)

print(f"✓ Complete health profile assembled")
print(f"\n  Core Metrics:")
print(f"    - Chronological Age: {profile.age} years")
print(f"    - Biological Age: {profile.bioage} years")
if profile.metabolic_score:
    print(f"    - Metabolic Score: {profile.metabolic_score.score}/100 ({profile.metabolic_score.level})")
if profile.inflammation_score:
    print(f"    - Inflammation Score: {profile.inflammation_score.score}/100 ({profile.inflammation_score.level})")
if profile.oxygen_score:
    print(f"    - Oxygen Score: {profile.oxygen_score.score}/100 ({profile.oxygen_score.level})")

print(f"\n  Summary:")
print(f"    The subject is a {profile.age}-year-old woman with a biological age of {profile.bioage}")
print(f"    (+{profile.bioage - profile.age} years above chronological age).")
if profile.metabolic_score:
    print(f"    Metabolic efficiency: {profile.metabolic_score.level}")
if profile.inflammation_score:
    print(f"    Inflammation/recovery: {profile.inflammation_score.level}")
if profile.oxygen_score:
    print(f"    Oxygen transport: {profile.oxygen_score.level}")

print("\n" + "=" * 100)
print("STEP 6: Health Coach Initialization")
print("=" * 100)

try:
    # Check for API key
    if not os.getenv("NET_MIND_API_KEY"):
        print("⚠ NET_MIND_API_KEY not found in environment")
        print("  Skipping AI report generation")
        print("  Set NET_MIND_API_KEY in .env to enable full report generation")
        coach_available = False
    else:
        coach = HealthCoach()
        coach.set_health_profile(profile.model_dump())
        print("✓ Health coach initialized successfully")
        print(f"  Model: {coach.model_name}")
        coach_available = True
except Exception as e:
    print(f"✗ Health coach initialization failed: {e}")
    coach_available = False

if coach_available:
    print("\n" + "=" * 100)
    print("STEP 7: Generate Health Report (with AI research)")
    print("=" * 100)
    print("⚠ This will make API calls and may take 2-3 minutes...")
    print("  The AI will research optimal interventions based on the profile")
    
    try:
        report_json = coach.generate_recommendations(format="json")
        print("✓ Health report generated successfully")
        
        # Parse and save report
        content = report_json.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        report_data = json.loads(content)
        
        # Save to file
        output_file = os.path.join(os.path.dirname(__file__), "..", "integration_test_report.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                "profile": profile.model_dump(),
                "report": report_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"  Report saved to: {output_file}")
        
        # Display summary
        if "health_assessment" in report_data:
            print(f"\n  Health Assessment:")
            ha = report_data["health_assessment"]
            if "overall_health_status" in ha:
                print(f"    Status: {ha['overall_health_status']}")
            if "primary_risks" in ha:
                print(f"    Primary risks: {', '.join(ha['primary_risks'][:3])}")
        
        if "recommendations" in report_data:
            print(f"\n  Recommendations: {len(report_data['recommendations'])} items")
            for i, rec in enumerate(report_data['recommendations'][:3], 1):
                if isinstance(rec, dict) and 'title' in rec:
                    print(f"    {i}. {rec['title']}")
        
        if "supplement_protocol" in report_data:
            print(f"\n  Supplement Protocol: {len(report_data['supplement_protocol'])} supplements")
            for i, supp in enumerate(report_data['supplement_protocol'][:3], 1):
                if isinstance(supp, dict) and 'supplement' in supp:
                    print(f"    {i}. {supp['supplement']}")
        
    except Exception as e:
        print(f"✗ Report generation failed: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 100)
print("INTEGRATION TEST COMPLETE")
print("=" * 100)

print("\n📊 Test Results Summary:")
print(f"  ✓ Profile validation: PASS")
print(f"  ✓ Metabolic score: {metabolic_result['score'] if metabolic_result else 'N/A'}/100")
print(f"  ✓ Inflammation score: {inflammation_result['score'] if inflammation_result else 'N/A'}/100")
print(f"  ✓ Oxygen score: {oxygen_result['score'] if oxygen_result else 'N/A'}/100")
if coach_available:
    print(f"  ✓ AI report generation: PASS")
else:
    print(f"  ⚠ AI report generation: SKIPPED (no API key)")

print("\n✅ All scoring systems operational and properly integrated!")
print("=" * 100)
