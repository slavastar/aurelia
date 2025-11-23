"""Quick test to verify API is responding."""
import requests
import json

# Test 1: Health check
print("Testing API health endpoint...")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"✅ Health check: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Root endpoint
print("\nTesting root endpoint...")
try:
    response = requests.get("http://localhost:8000/", timeout=5)
    print(f"✅ Root: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Small profile test
print("\nTesting generate-report endpoint with minimal data...")
try:
    profile = {
        "age": 30,
        "height": 170,
        "weight": 63,
        "bioage": 31.2,
        "lifestyle_quiz": {"name": "Test"},
        "biomarkers": {
            "fasting_glucose": "5.2 mmol/L",
            "fasting_insulin": "8.5 µIU/mL"
        },
        "is_menstruating": True
    }
    
    print("Sending request...")
    response = requests.post(
        "http://localhost:8000/generate-report",
        json=profile,
        timeout=180
    )
    print(f"✅ Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Report generated successfully!")
        if "health_profile" in data:
            profile = data["health_profile"]
            if profile.get("metabolic_score"):
                print(f"Metabolic Score: {profile['metabolic_score']['score']:.1f}/100")
    else:
        print(f"Error: {response.text[:200]}")
except Exception as e:
    print(f"❌ Error: {e}")
