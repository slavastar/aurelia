"""Test metabolic score calculation."""

from metabolic_scores import MetabolicScore

# Test case 1: Normal/Optimal values
print("=" * 80)
print("TEST 1: Optimal Metabolic Health")
print("=" * 80)

biomarkers_optimal = {
    'fasting_glucose': '82 mg/dL',  # ~4.55 mmol/L
    'fasting_insulin': '6 µIU/mL',
    'triglycerides': '50 mg/dL',  # 0.5 g/L
    'HDL_cholesterol': '56 mg/dL',  # 0.56 g/L
    'ApoB': '74 mg/dL',  # 0.74 g/L
    'ApoA1': '119 mg/dL',  # 1.19 g/L
    'HbA1c': '5.0%'
}

result = MetabolicScore.compute_metabolic_score(biomarkers_optimal)
if result:
    print(f"\nMetabolic Efficiency Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")
else:
    print("Could not calculate score (insufficient biomarkers)")

# Test case 2: Borderline values
print("\n" + "=" * 80)
print("TEST 2: Borderline Metabolic Health")
print("=" * 80)

biomarkers_borderline = {
    'fasting_glucose': '104 mg/dL',  # ~5.8 mmol/L
    'fasting_insulin': '12 µIU/mL',
    'triglycerides': '150 mg/dL',  # 1.5 g/L
    'HDL_cholesterol': '45 mg/dL',  # 0.45 g/L
    'ApoB': '110 mg/dL',  # 1.1 g/L
    'ApoA1': '110 mg/dL',  # 1.1 g/L
    'HbA1c': '5.9%'
}

result = MetabolicScore.compute_metabolic_score(biomarkers_borderline)
if result:
    print(f"\nMetabolic Efficiency Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 3: Poor metabolic health
print("\n" + "=" * 80)
print("TEST 3: Poor Metabolic Health")
print("=" * 80)

biomarkers_poor = {
    'fasting_glucose': '126 mg/dL',  # ~7.0 mmol/L
    'fasting_insulin': '20 µIU/mL',
    'triglycerides': '200 mg/dL',  # 2.0 g/L
    'HDL_cholesterol': '40 mg/dL',  # 0.40 g/L
    'ApoB': '150 mg/dL',  # 1.5 g/L
    'ApoA1': '90 mg/dL',  # 0.9 g/L
    'HbA1c': '7.2%'
}

result = MetabolicScore.compute_metabolic_score(biomarkers_poor)
if result:
    print(f"\nMetabolic Efficiency Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 4: Partial biomarkers (like the original test data)
print("\n" + "=" * 80)
print("TEST 4: Partial Biomarkers (Original Test Profile)")
print("=" * 80)

biomarkers_partial = {
    'fasting_glucose': '102 mg/dL',
    'HbA1c': '5.8%',
    'triglycerides': '180 mg/dL',
    'HDL_cholesterol': '45 mg/dL',
    # Missing: insulin, ApoB, ApoA1
}

result = MetabolicScore.compute_metabolic_score(biomarkers_partial)
if result:
    print(f"\nMetabolic Efficiency Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']} (partial data)")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")
        else:
            print(f"  - {key}: Not available")
else:
    print("Could not calculate score (insufficient biomarkers)")

print("\n" + "=" * 80)
