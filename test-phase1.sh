#!/bin/bash

echo "🧪 AURELIA Phase 1 Testing Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

# Function to test API with JSON
test_api_json() {
    local name=$1
    local url=$2
    local method=$3
    local data=$4

    echo -n "Testing $name... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")

        status=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
    else
        response=$(curl -s "$url" -w "\n%{http_code}")
        status=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
    fi

    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "   Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body | head -c 100)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status)"
        echo "   Response: $body"
        ((FAILED++))
    fi
}

echo "1. Testing Homepage"
echo "-------------------"
test_endpoint "Homepage" "http://localhost:3000" 200
echo ""

echo "2. Testing API Endpoints"
echo "------------------------"
test_api_json "Health Check" "http://localhost:3000/api/analyze" "GET" ""
echo ""

echo "3. Testing ML Model Mock"
echo "------------------------"
test_data='{
  "biomarkers": {
    "HbA1c": 5.4,
    "Ferritin": 45,
    "CRP": 1.2,
    "TSH": 2.1
  },
  "context": {
    "age": 34,
    "cycle_status": "follicular",
    "symptoms": ["fatigue"]
  }
}'

test_api_json "ML Model Endpoint" "http://localhost:3000/api/ml-model" "POST" "$test_data"
echo ""

echo "4. Testing File Structure"
echo "-------------------------"
check_file() {
    local file=$1
    echo -n "Checking $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ MISSING${NC}"
        ((FAILED++))
    fi
}

check_file "package.json"
check_file "tsconfig.json"
check_file "tailwind.config.ts"
check_file "next.config.js"
check_file "app/page.tsx"
check_file "app/layout.tsx"
check_file "lib/aurelia/system-prompt.ts"
check_file "lib/aurelia/safety-guardrails.ts"
check_file "lib/gemini/client.ts"
check_file "lib/ml-model/mock-client.ts"
check_file ".env.local"
check_file "TODO.md"
check_file "README.md"
echo ""

echo "5. Testing TypeScript Compilation"
echo "----------------------------------"
echo -n "Running type check... "
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi
echo ""

echo "6. Testing Environment Variables"
echo "---------------------------------"
check_env() {
    local var=$1
    echo -n "Checking $var... "
    if grep -q "^$var=" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓ SET${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ NOT SET${NC}"
    fi
}

check_env "MISTRAL_API_KEY"
check_env "GOOGLE_CLOUD_PROJECT_ID"
echo ""

echo "=================================="
echo "📊 Test Results Summary"
echo "=================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Phase 1 is complete.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
