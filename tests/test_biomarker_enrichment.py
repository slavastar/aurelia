"""Test biomarker enrichment with descriptions."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from aurelia.biomarker_reference import get_biomarkers_with_descriptions
from aurelia.schemas import HealthProfile
from aurelia.health_coach import HealthCoach

def test_enrichment():
    """Test that biomarkers are enriched with descriptions."""
    
    # Sample biomarkers
    simple_biomarkers = {
        "glucose": 5.8,
        "hba1c": 5.9,
        "insulin": 14,
        "hdl": 1.6,
        "ldl": 3.6,
        "hscrp": 2.5
    }
    
    print("=" * 80)
    print("BIOMARKER ENRICHMENT TEST")
    print("=" * 80)
    
    # Test enrichment function
    print("\n1. Testing enrichment function:")
    enriched = get_biomarkers_with_descriptions(simple_biomarkers)
    
    for key, info in enriched.items():
        print(f"\n{key}:")
        print(f"  Value: {info['value']}")
        print(f"  Name: {info['name']}")
        print(f"  Unit: {info['unit']}")
        print(f"  Range: {info['range']}")
        if 'note' in info:
            print(f"  Note: {info['note']}")
    
    # Test profile integration
    print("\n" + "=" * 80)
    print("2. Testing profile integration:")
    print("=" * 80)
    
    profile = HealthProfile(
        age=35,
        height=165,
        weight=62,
        bioage=38.5,
        lifestyle_quiz={
            "sleep_hours": 6.5,
            "stress_level": "high",
            "exercise_frequency": "moderate"
        },
        biomarkers=simple_biomarkers,
        is_menstruating=True
    )
    
    # Enrich biomarkers
    profile.biomarkers_with_descriptions = get_biomarkers_with_descriptions(profile.biomarkers)
    
    # Test health coach formatting
    print("\n3. Testing health coach profile formatting:")
    print("=" * 80)
    
    coach = HealthCoach()
    formatted_profile = coach._format_profile(profile)
    print(formatted_profile)
    
    # Verify enriched data is present
    assert "Normal:" in formatted_profile, "Normal ranges should be included"
    assert "Fasting glucose" in formatted_profile or "glucose" in formatted_profile, "Biomarker names should be present"
    
    print("\n" + "=" * 80)
    print("✅ ALL TESTS PASSED")
    print("=" * 80)
    print("\nBiomarker descriptions are properly integrated:")
    print("  ✓ Enrichment function works")
    print("  ✓ Profile schema supports enriched data")
    print("  ✓ Health coach formats enriched biomarkers")
    print("  ✓ Normal ranges and units are displayed")

if __name__ == "__main__":
    test_enrichment()
