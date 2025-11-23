"""Test inflammation score calculation for both menstruating and non-menstruating women."""

from inflammation_scores import InflammationScore

print("=" * 80)
print("MENSTRUATING WOMEN (Premenopausal)")
print("=" * 80)

# Test case 1: Optimal - low inflammation
print("\n" + "=" * 80)
print("TEST 1: Optimal Inflammation (Menstruating)")
print("=" * 80)

biomarkers_optimal_pre = {
    'hsCRP': '0.4 mg/L',    # optimal <0.5
    'ESR': '10 mm/h',        # normal <20
    'ferritin': '70 µg/L',   # normal range
    'WBC': '6.0 x10^9/L'     # normal 4-11
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_optimal_pre,
    is_menstruating=True
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"Is menstruating: {result['is_menstruating']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")
else:
    print("Could not calculate score")

# Test case 2: Moderate inflammation
print("\n" + "=" * 80)
print("TEST 2: Moderate Inflammation (Menstruating)")
print("=" * 80)

biomarkers_moderate_pre = {
    'hsCRP': '2.5 mg/L',     # borderline 1-3
    'ESR': '20 mm/h',         # upper normal limit
    'ferritin': '90 µg/L',    # elevated (inflammation marker)
    'WBC': '9.0 x10^9/L'      # upper normal
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_moderate_pre,
    is_menstruating=True
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 3: High inflammation
print("\n" + "=" * 80)
print("TEST 3: High Inflammation (Menstruating)")
print("=" * 80)

biomarkers_high_pre = {
    'hsCRP': '5.0 mg/L',      # high >3
    'ESR': '35 mm/h',          # elevated
    'ferritin': '150 µg/L',    # high (inflammation)
    'WBC': '12.0 x10^9/L'      # elevated (>11)
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_high_pre,
    is_menstruating=True
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

print("\n" + "=" * 80)
print("NON-MENSTRUATING WOMEN (Postmenopausal)")
print("=" * 80)

# Test case 4: Optimal - low inflammation (postmenopausal)
print("\n" + "=" * 80)
print("TEST 4: Optimal Inflammation (Non-Menstruating)")
print("=" * 80)

biomarkers_optimal_post = {
    'hsCRP': '0.4 mg/L',      # very low
    'ESR': '10 mm/h',          # low
    'ferritin': '70 µg/L',     # below postmenopausal mean
    'WBC': '6.0 x10^9/L'       # normal
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_optimal_post,
    is_menstruating=False
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"Is menstruating: {result['is_menstruating']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 5: Moderate inflammation (postmenopausal)
print("\n" + "=" * 80)
print("TEST 5: Moderate Inflammation (Non-Menstruating)")
print("=" * 80)

biomarkers_moderate_post = {
    'hsCRP': '3.0 mg/L',       # elevated
    'ESR': '30 mm/h',           # elevated
    'ferritin': '150 µg/L',     # moderately elevated
    'WBC': '9.0 x10^9/L'        # upper normal
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_moderate_post,
    is_menstruating=False
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
    print(f"Level: {result['level']}")
    print(f"Markers used: {result['markers_used']}")
    print(f"\nDescription: {result['description']}")
    print(f"\nSummary: {result['summary']}")
    print(f"\nComponents:")
    for key, value in result['components'].items():
        if value:
            print(f"  - {key}: {value:.2f}")

# Test case 6: High inflammation (postmenopausal)
print("\n" + "=" * 80)
print("TEST 6: High Inflammation (Non-Menstruating)")
print("=" * 80)

biomarkers_high_post = {
    'hsCRP': '6.0 mg/L',       # very high
    'ESR': '45 mm/h',           # very high
    'ferritin': '250 µg/L',     # very high
    'WBC': '13.0 x10^9/L'       # elevated
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_high_post,
    is_menstruating=False
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
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
print("TEST 7: Partial Biomarkers (Menstruating)")
print("=" * 80)

biomarkers_partial = {
    'hsCRP': '1.2 mg/L',
    'ESR': '15 mm/h',
    # Missing: ferritin, WBC
}

result = InflammationScore.compute_inflammation_score(
    biomarkers_partial,
    is_menstruating=True
)

if result:
    print(f"\nInflammation/Recovery Score: {result['score']}")
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
