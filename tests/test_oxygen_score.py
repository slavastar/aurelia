"""Test oxygen transport score calculation."""

from oxygen_scores import OxygenScore

print("=" * 80)
print("OXYGEN TRANSPORT CAPACITY SCORE TESTS")
print("=" * 80)

# Test case 1: Optimal - excellent oxygen transport
print("\n" + "=" * 80)
print("TEST 1: Optimal Oxygen Transport")
print("=" * 80)

biomarkers_optimal = {
    'hemoglobin': '14.5 g/dL',    # excellent (normal 12-16)
    'hematocrit': '43 %',          # excellent (normal 36-46)
    'rbc': '4.7 x10^12/L',         # good (normal 3.9-5.1)
    'iron': '110 µg/dL'            # good (normal 60-170)
}

result = OxygenScore.compute_oxygen_score(biomarkers_optimal)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
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

# Test case 2: Good - slightly below optimal
print("\n" + "=" * 80)
print("TEST 2: Good Oxygen Transport (Slightly Low)")
print("=" * 80)

biomarkers_good = {
    'hemoglobin': '12.5 g/dL',     # lower normal
    'hematocrit': '38 %',           # lower normal
    'rbc': '4.2 x10^12/L',          # lower normal
    'iron': '70 µg/dL'              # lower normal
}

result = OxygenScore.compute_oxygen_score(biomarkers_good)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 3: Borderline - mild anemia
print("\n" + "=" * 80)
print("TEST 3: Borderline (Mild Anemia)")
print("=" * 80)

biomarkers_borderline = {
    'hemoglobin': '11.0 g/dL',     # mild anemia
    'hematocrit': '34 %',           # slightly low
    'rbc': '3.8 x10^12/L',          # slightly low
    'iron': '50 µg/dL'              # low
}

result = OxygenScore.compute_oxygen_score(biomarkers_borderline)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 4: Poor - significant anemia
print("\n" + "=" * 80)
print("TEST 4: Poor (Significant Anemia)")
print("=" * 80)

biomarkers_poor = {
    'hemoglobin': '9.5 g/dL',      # moderate anemia
    'hematocrit': '30 %',           # low
    'rbc': '3.5 x10^12/L',          # low
    'iron': '35 µg/dL'              # very low (iron deficiency)
}

result = OxygenScore.compute_oxygen_score(biomarkers_poor)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 5: Example from user (should match expected ~100)
print("\n" + "=" * 80)
print("TEST 5: User Example Data")
print("=" * 80)

biomarkers_example = {
    'hemoglobin': '13.2 g/dL',
    'hematocrit': '40 %',
    'rbc': '4.4 x10^12/L',
    'iron': '85 µg/dL'
}

result = OxygenScore.compute_oxygen_score(biomarkers_example)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 6: High values (should NOT be penalized)
print("\n" + "=" * 80)
print("TEST 6: High Values (No Penalty for High Oxygen Capacity)")
print("=" * 80)

biomarkers_high = {
    'hemoglobin': '16.0 g/dL',     # high but normal
    'hematocrit': '48 %',           # high
    'rbc': '5.2 x10^12/L',          # high
    'iron': '150 µg/dL'             # high but normal
}

result = OxygenScore.compute_oxygen_score(biomarkers_high)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 7: Partial biomarkers
print("\n" + "=" * 80)
print("TEST 7: Partial Biomarkers (Hb + Hct only)")
print("=" * 80)

biomarkers_partial = {
    'hemoglobin': '12.0 g/dL',
    'hematocrit': '37 %',
    # Missing: RBC, iron
}

result = OxygenScore.compute_oxygen_score(biomarkers_partial)

if result:
    print(f"\nOxygen Transport Score: {result['score']}")
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
