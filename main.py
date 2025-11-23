from health_coach import HealthCoach

def generate_health_report():
    """Generate a comprehensive health report with recommendations."""
    
    print("="*80)
    print("AURELIA - AI Health Recommendation Coach")
    print("="*80)
    
    # Initialize model
    print("\n[1/3] Initializing AI model...")
    model = HealthCoach()
    
    # Example health profile - in production, this would come from user data
    health_profile = {
        "age": 35,
        "height": 175,  # cm
        "weight": 78,   # kg
        "bioage": 38.5,  # Biological age
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
            "fasting_glucose": "102 mg/dL",  # Slightly elevated
            "HbA1c": "5.8%",  # Prediabetic range
            "total_cholesterol": "220 mg/dL",  # Borderline high
            "LDL_cholesterol": "145 mg/dL",  # Elevated
            "HDL_cholesterol": "45 mg/dL",  # Low
            "triglycerides": "180 mg/dL",  # Elevated
            "vitamin_D": "22 ng/mL",  # Insufficient
            "TSH": "2.8 mIU/L",  # Normal
            "CRP": "3.2 mg/L"  # Elevated inflammation
        }
    }
    
    # Set the health profile
    print("\n[2/3] Loading health profile and analyzing biomarkers...")
    model.set_health_profile(health_profile)
    
    # Generate comprehensive recommendations in JSON format
    print("\n[3/3] Generating personalized health recommendations (JSON format)...")
    print("\nThis may take a moment as we search for evidence-based interventions...\n")
    
    print("="*80)
    print("PERSONALIZED HEALTH OPTIMIZATION REPORT")
    print("="*80)
    print()
    
    report = model.generate_recommendations(format="json")
    
    if report:
        # Display the report
        print(report)
        
        # Save to file
        print("\n" + "="*80)
        print("Saving report to file...")
        try:
            filename = model.save_report(report, format="json")
            print(f"✓ Report saved successfully to: {filename}")
        except Exception as e:
            print(f"✗ Error saving report: {str(e)}")
    else:
        print("Error: No report generated")
    
    print("\n" + "="*80)
    print("Report generation complete!")
    print("="*80)

if __name__ == "__main__":
    generate_health_report()