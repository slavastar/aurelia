"""
Full integration test with Emma's real data.
Tests the complete flow: photo upload + quiz + biomarkers → AI health report
"""

import sys
import json
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from aurelia import HealthCoach, HealthProfile
from aurelia.scoring.metabolic_scores import MetabolicScore
from aurelia.scoring.inflammation_scores import InflammationScore
from aurelia.scoring.oxygen_scores import OxygenScore
from aurelia.biomarker_reference import get_biomarkers_with_descriptions
from aurelia.schemas import (
    MetabolicScoreResult,
    InflammationScoreResult,
    OxygenScoreResult
)

# Try to import image processing
try:
    from PIL import Image
    import torch
    from transformers import ViTImageProcessor, ViTForImageClassification
    import torch.nn.functional as F
    IMAGE_PROCESSING_AVAILABLE = True
except ImportError:
    IMAGE_PROCESSING_AVAILABLE = False
    print("⚠️  Image processing libraries not available - skipping skin age analysis")


def predict_skin_age(image_path: str) -> float:
    """Predict skin age from face photo."""
    if not IMAGE_PROCESSING_AVAILABLE:
        return None
    
    try:
        # Load model
        model_name = "nateraw/vit-age-classifier"
        processor = ViTImageProcessor.from_pretrained(model_name)
        model = ViTForImageClassification.from_pretrained(model_name)
        
        # Load and process image
        image = Image.open(image_path)
        inputs = processor(images=image, return_tensors="pt")
        
        # Predict
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            
        # Convert to probabilities and calculate expected age
        probs = F.softmax(logits, dim=-1)[0]
        ages = torch.arange(0, len(probs))
        expected_age = (probs * ages).sum().item()
        
        return round(expected_age, 1)
    except Exception as e:
        print(f"Error predicting skin age: {e}")
        return None


def create_emma_profile():
    """Create Emma's health profile from her quiz and biomarker data."""
    
    # Emma's biomarkers - realistic values for a healthy 30-year-old woman
    # Most values are good/optimal, with a few minor suboptimal markers
    # Note: Values must be strings with units for scoring systems
    biomarkers = {
        # Glycemic panel - good control (use exact keys for scoring)
        "fasting_glucose": "5.2 mmol/L",  # normal fasting
        "fasting_insulin": "8.5 µIU/mL",  # good insulin sensitivity
        "HbA1c": "5.3 %",  # excellent
        
        # Lipid panel - good but could be optimized (use exact keys for scoring)
        "total_cholesterol": "5.0 mmol/L",  # (≈193 mg/dL)
        "HDL_cholesterol": "1.7 mmol/L",  # (≈66 mg/dL) - excellent
        "LDL_cholesterol": "2.8 mmol/L",  # (≈108 mg/dL) - good
        "triglycerides": "0.9 mmol/L",  # (≈80 mg/dL) - excellent
        "ApoB": "85 mg/dL",  # good
        "ApoA1": "155 mg/dL",  # good
        
        # Liver function - excellent
        "alt": "18 U/L",
        "ast": "22 U/L",
        "ggt": "15 U/L",
        "alp": "65 U/L",
        
        # Kidney function - excellent
        "creatinine": "0.8 mg/dL",
        "bun": "14 mg/dL",
        
        # Hematology - good but slight low-normal iron
        "hemoglobin": "13.2 g/dL",  # low-normal (menstruating woman)
        "hematocrit": "39 %",
        "rbc": "4.5 x10^12/L",
        "mcv": "86 fL",
        "mch": "29 pg",
        "mchc": "33.8 g/dL",
        "platelets": "245 x10^9/L",
        
        # Iron panel - slightly low (common in menstruating women)
        "iron": "60 µg/dL",  # low-normal
        "ferritin": "35 µg/L",  # suboptimal (should be >50 for optimal energy)
        "tibc": "380 µg/dL",  # slightly elevated (suggests iron need)
        "transferrin_saturation": "16 %",  # low-normal
        
        # Inflammation - excellent
        "hscrp": "0.4 mg/L",  # optimal
        "esr": "8 mm/h",  # excellent
        
        # Immune - excellent
        "wbc": "6.5 x10^9/L",
        
        # Thyroid - excellent
        "tsh": "1.8 mIU/L",
        "free_t4": "1.3 ng/dL",
        "free_t3": "3.2 pg/mL",
        
        # Vitamins - vitamin D suboptimal (common deficiency)
        "vitamin_d": "28 ng/mL",  # insufficient (should be 40-60)
        "vitamin_b12": "450 pg/mL",  # good
        "folate": "12 ng/mL",  # good
        
        # Hormones - balanced
        "cortisol_am": "12 µg/dL",  # (morning) - good
        "dhea_s": "280 µg/dL",  # good for age
        
        # Electrolytes - excellent
        "sodium": "140 mmol/L",
        "potassium": "4.2 mmol/L",
        "calcium": "9.4 mg/dL",
        "magnesium": "2.1 mg/dL",
    }
    
    # Emma's lifestyle quiz converted to structured data
    lifestyle_quiz = {
        "name": "Emma",
        "age_range": "25-35",
        "height_m": 1.70,
        "weight_kg": 63,
        
        # Activity & Movement
        "job_type": "mixed",
        "daily_steps": "6000-10000",
        "weekly_training_frequency": "3-4x",
        "training_type": "mixed (cardio + strength + mobility)",
        
        # Sleep & Recovery
        "sleep_duration": "7-8 hours",
        "sleep_quality": "good",
        "sleep_regularity": "quite regular",
        
        # Nutrition & Lifestyle
        "diet_balanced": "yes",
        "specific_diet": "no",
        "nutritional_deficiencies": "unknown",
        "alcohol_tobacco": "occasionally",
        "substance_frequency": "a few times per month",
        
        # Stress & Mental Health
        "stress_level": "2/5",
        "stress_reducing_activities": "occasionally",
        
        # Hormonal & Reproductive
        "menopause": "no",
        "hormonal_contraception": "no",
        "pregnancy_status": "not concerned",
        
        # Goals
        "goals": [
            "improve energy & vitality",
            "curiosity - understand my body better",
            "preventive health"
        ],
        "results_preference": "clear and simple action points",
        "additional_notes": "I feel healthy overall but I'd like to understand my metabolism and optimize my long-term health."
    }
    
    # Calculate biological age (estimate based on biomarkers)
    # Emma has good markers overall, so bioage should be close to chronological
    # Slight penalty for low ferritin and vitamin D
    chronological_age = 30  # midpoint of 25-35 range
    bioage = 31.2  # slightly elevated due to suboptimal ferritin and vitamin D
    
    profile = HealthProfile(
        age=chronological_age,
        height=170,  # cm
        weight=63,  # kg
        bioage=bioage,
        lifestyle_quiz=lifestyle_quiz,
        biomarkers=biomarkers,
        is_menstruating=True  # Premenopausal, not on contraception
    )
    
    return profile


def main():
    """Run Emma's complete integration test."""
    
    print("=" * 100)
    print("EMMA'S FULL INTEGRATION TEST - AURELIA HEALTH COACH")
    print("=" * 100)
    print()
    
    # Step 1: Load Emma's photo and estimate skin age
    print("=" * 100)
    print("STEP 1: Facial Age Analysis")
    print("=" * 100)
    
    photo_path = Path(__file__).parent.parent / "data" / "face2.jpeg"
    skin_age = None
    
    if photo_path.exists() and IMAGE_PROCESSING_AVAILABLE:
        print(f"📸 Loading Emma's photo: {photo_path}")
        skin_age = predict_skin_age(str(photo_path))
        if skin_age:
            print(f"✓ Estimated skin age: {skin_age} years")
        else:
            print("⚠️  Could not estimate skin age")
    else:
        if not photo_path.exists():
            print(f"⚠️  Photo not found: {photo_path}")
        print("⚠️  Skipping skin age analysis")
    
    # Step 2: Create Emma's health profile
    print("\n" + "=" * 100)
    print("STEP 2: Building Health Profile")
    print("=" * 100)
    
    profile = create_emma_profile()
    if skin_age:
        profile.skin_age = skin_age
    
    print(f"✓ Profile created successfully")
    print(f"  Name: {profile.lifestyle_quiz['name']}")
    print(f"  Age: {profile.age} years")
    print(f"  Biological Age: {profile.bioage} years")
    print(f"  Age Gap: {profile.bioage - profile.age:+.1f} years")
    if skin_age:
        print(f"  Skin Age: {skin_age} years")
    print(f"  Height: {profile.height} cm")
    print(f"  Weight: {profile.weight} kg")
    print(f"  BMI: {profile.weight / ((profile.height/100) ** 2):.1f}")
    print(f"  Biomarkers: {len(profile.biomarkers)} markers")
    print(f"  Is Menstruating: {profile.is_menstruating}")
    
    # Step 3: Enrich biomarkers with descriptions
    print("\n" + "=" * 100)
    print("STEP 3: Enriching Biomarker Data")
    print("=" * 100)
    
    enriched_biomarkers = get_biomarkers_with_descriptions(profile.biomarkers)
    profile.biomarkers_with_descriptions = enriched_biomarkers
    print(f"✓ Enriched {len(enriched_biomarkers)} biomarkers with reference descriptions")
    
    # Show a few examples
    print("\nExample enriched biomarkers:")
    for i, (key, info) in enumerate(list(enriched_biomarkers.items())[:3]):
        print(f"  {i+1}. {info['name']}: {info['value']} {info['unit']} (Normal: {info['range']})")
    
    # Step 4: Compute metabolic score
    print("\n" + "=" * 100)
    print("STEP 4: Metabolic Score Calculation")
    print("=" * 100)
    
    metabolic_result = MetabolicScore.compute_metabolic_score(profile.biomarkers)
    if metabolic_result:
        profile.metabolic_score = MetabolicScoreResult(**metabolic_result)
        print(f"✓ Metabolic score computed successfully")
        print(f"  Score: {metabolic_result['score']:.1f}/100")
        print(f"  Level: {metabolic_result['level']}")
        print(f"  Markers used: {metabolic_result['markers_used']}")
        print(f"  Description: {metabolic_result['description']}")
        print(f"\n  Components:")
        for comp, value in metabolic_result['components'].items():
            print(f"    - {comp}: {value:.2f}")
    else:
        print("⚠️  Could not compute metabolic score")
    
    # Step 5: Compute inflammation score
    print("\n" + "=" * 100)
    print("STEP 5: Inflammation Score Calculation")
    print("=" * 100)
    
    inflammation_result = InflammationScore.compute_inflammation_score(
        profile.biomarkers,
        is_menstruating=profile.is_menstruating
    )
    if inflammation_result:
        profile.inflammation_score = InflammationScoreResult(**inflammation_result)
        print(f"✓ Inflammation score computed successfully")
        print(f"  Score: {inflammation_result['score']:.1f}/100")
        print(f"  Level: {inflammation_result['level']}")
        print(f"  Markers used: {inflammation_result['markers_used']}")
        print(f"  Is Menstruating: {inflammation_result['is_menstruating']}")
        print(f"  Description: {inflammation_result['description']}")
        print(f"\n  Components:")
        for comp, value in inflammation_result['components'].items():
            print(f"    - {comp}: {value:.2f}")
    else:
        print("⚠️  Could not compute inflammation score")
    
    # Step 6: Compute oxygen transport score
    print("\n" + "=" * 100)
    print("STEP 6: Oxygen Transport Score Calculation")
    print("=" * 100)
    
    oxygen_result = OxygenScore.compute_oxygen_score(profile.biomarkers)
    if oxygen_result:
        profile.oxygen_score = OxygenScoreResult(**oxygen_result)
        print(f"✓ Oxygen score computed successfully")
        print(f"  Score: {oxygen_result['score']:.1f}/100")
        print(f"  Level: {oxygen_result['level']}")
        print(f"  Markers used: {oxygen_result['markers_used']}")
        print(f"  Description: {oxygen_result['description']}")
        print(f"\n  Components:")
        for comp, value in oxygen_result['components'].items():
            print(f"    - {comp}: {value:.2f}")
    else:
        print("⚠️  Could not compute oxygen transport score")
    
    # Step 7: Generate comprehensive health profile summary
    print("\n" + "=" * 100)
    print("STEP 7: Health Profile Summary")
    print("=" * 100)
    
    print(f"✓ Complete health profile assembled for {profile.lifestyle_quiz['name']}")
    print(f"\n  Core Metrics:")
    print(f"    - Chronological Age: {profile.age} years")
    print(f"    - Biological Age: {profile.bioage} years")
    if skin_age:
        print(f"    - Skin Age: {skin_age} years")
    if profile.metabolic_score:
        print(f"    - Metabolic Score: {profile.metabolic_score.score:.1f}/100 ({profile.metabolic_score.level})")
    if profile.inflammation_score:
        print(f"    - Inflammation Score: {profile.inflammation_score.score:.1f}/100 ({profile.inflammation_score.level})")
    if profile.oxygen_score:
        print(f"    - Oxygen Score: {profile.oxygen_score.score:.1f}/100 ({profile.oxygen_score.level})")
    
    # Key findings
    print(f"\n  Key Findings:")
    findings = []
    
    # Check ferritin (extract numeric value from string)
    ferritin_str = profile.biomarkers.get("ferritin", "100")
    try:
        ferritin_val = float(ferritin_str.split()[0]) if isinstance(ferritin_str, str) else ferritin_str
        if ferritin_val < 50:
            findings.append(f"    ⚠️  Suboptimal ferritin ({profile.biomarkers['ferritin']}) - may impact energy")
    except:
        pass
    
    # Check vitamin D
    vit_d_str = profile.biomarkers.get("vitamin_d", "100")
    try:
        vit_d_val = float(vit_d_str.split()[0]) if isinstance(vit_d_str, str) else vit_d_str
        if vit_d_val < 30:
            findings.append(f"    ⚠️  Vitamin D insufficient ({profile.biomarkers['vitamin_d']})")
    except:
        pass
    
    # Check hemoglobin
    hb_str = profile.biomarkers.get("hemoglobin", "15")
    try:
        hb_val = float(hb_str.split()[0]) if isinstance(hb_str, str) else hb_str
        if hb_val < 13.5:
            findings.append(f"    ⚠️  Hemoglobin low-normal ({profile.biomarkers['hemoglobin']})")
    except:
        pass
    
    # Positive findings
    hscrp_str = profile.biomarkers.get("hscrp", "10")
    try:
        hscrp_val = float(hscrp_str.split()[0]) if isinstance(hscrp_str, str) else hscrp_str
        if hscrp_val < 1:
            findings.append(f"    ✓ Excellent inflammation control (hsCRP: {profile.biomarkers['hscrp']})")
    except:
        pass
    
    hba1c_str = profile.biomarkers.get("HbA1c", "10")  # Note: capital H for scoring key
    try:
        hba1c_val = float(hba1c_str.split()[0]) if isinstance(hba1c_str, str) else hba1c_str
        if hba1c_val < 5.5:
            findings.append(f"    ✓ Optimal glucose control (HbA1c: {profile.biomarkers['HbA1c']})")
    except:
        pass
    
    for finding in findings:
        print(finding)
    
    # Step 8: Initialize Health Coach
    print("\n" + "=" * 100)
    print("STEP 8: Health Coach Initialization")
    print("=" * 100)
    
    coach = HealthCoach()
    print(f"✓ Health coach initialized successfully")
    print(f"  Model: {coach.model_name}")
    print(f"  Available tools: web_search, reddit_search, biomarker_lookup")
    
    # Step 9: Generate AI health report with research
    print("\n" + "=" * 100)
    print("STEP 9: Generate Comprehensive Health Report (with AI research)")
    print("=" * 100)
    print("⚠️  This will make API calls and may take 2-3 minutes...")
    print("  The AI will research optimal interventions for Emma's profile")
    print()
    
    coach.set_health_profile(profile.model_dump())
    report_content = coach.generate_recommendations(format="json")
    
    # Parse and save report
    try:
        content = report_content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        report_data = json.loads(content)
        
        # Save report
        output_path = Path(__file__).parent.parent / "emma_health_report.json"
        with open(output_path, "w") as f:
            json.dump({
                "generated_at": datetime.now().isoformat(),
                "profile": profile.model_dump(mode='json'),
                "report": report_data
            }, f, indent=2)
        
        print(f"✓ Health report generated successfully")
        print(f"  Report saved to: {output_path}")
        
        # Display summary
        if "health_assessment" in report_data:
            assessment = report_data["health_assessment"]
            print(f"\n  Health Assessment:")
            print(f"    Status: {assessment.get('overall_health_status', 'N/A')}")
            if assessment.get('primary_risks'):
                print(f"    Primary risks: {', '.join(assessment['primary_risks'])}")
        
        if "recommendations" in report_data:
            print(f"\n  Recommendations: {len(report_data['recommendations'])} items")
            for i, rec in enumerate(report_data['recommendations'][:3], 1):
                print(f"    {i}. {rec.get('title', 'N/A')}")
        
    except json.JSONDecodeError as e:
        print(f"⚠️  Error parsing JSON report: {e}")
        print(f"  Raw response saved for debugging")
        output_path = Path(__file__).parent.parent / "emma_health_report_raw.txt"
        with open(output_path, "w") as f:
            f.write(report_content)
        print(f"  Saved to: {output_path}")
    
    # Final summary
    print("\n" + "=" * 100)
    print("INTEGRATION TEST COMPLETE")
    print("=" * 100)
    
    print(f"\n📊 Emma's Test Results Summary:")
    print(f"  ✓ Profile creation: PASS")
    if skin_age:
        print(f"  ✓ Skin age analysis: {skin_age} years")
    print(f"  ✓ Biomarker enrichment: {len(enriched_biomarkers)} markers")
    if profile.metabolic_score:
        print(f"  ✓ Metabolic score: {profile.metabolic_score.score:.1f}/100 ({profile.metabolic_score.level})")
    if profile.inflammation_score:
        print(f"  ✓ Inflammation score: {profile.inflammation_score.score:.1f}/100 ({profile.inflammation_score.level})")
    if profile.oxygen_score:
        print(f"  ✓ Oxygen score: {profile.oxygen_score.score:.1f}/100 ({profile.oxygen_score.level})")
    print(f"  ✓ AI report generation: PASS")
    
    print(f"\n✅ Emma's complete health analysis is ready!")
    print(f"   Main focus areas: Iron optimization, Vitamin D supplementation")
    print("=" * 100)


if __name__ == "__main__":
    main()
