#!/bin/bash
BASE_URL="http://localhost:5000"

echo "🚀 FUTUREBYTE API TEST SUITE"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Root endpoint
echo -e "${BLUE}1️⃣ Testing Root Endpoint${NC}"
ROOT_RESPONSE=$(curl -s $BASE_URL/)
echo $ROOT_RESPONSE | jq .
echo ""

# Test 2: Create items
echo -e "${BLUE}2️⃣ Creating Test Items${NC}"
ITEMS=(
  "Web Development"
  "Data Science"
  "Cloud Computing"
  "Cybersecurity"
  "Blockchain"
)

for item in "${ITEMS[@]}"; do
  echo -e "${YELLOW}Creating:${NC} $item"
  curl -s -X POST $BASE_URL/api/items \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$item\",\"description\":\"Complete $item course with hands-on projects\"}" \
    | jq -r '.message'
done
echo ""

# Test 3: Get all items
echo -e "${BLUE}3️⃣ Getting All Items${NC}"
curl -s $BASE_URL/api/items | jq '.[] | {name, description}'
echo ""

# Test 4: Get item count
echo -e "${BLUE}4️⃣ Item Count${NC}"
COUNT=$(curl -s $BASE_URL/api/items | jq 'length')
echo -e "${GREEN}Total items: $COUNT${NC}"
echo ""

# Test 5: Test validation (should fail)
echo -e "${BLUE}5️⃣ Testing Validation (Should Fail)${NC}"
echo -e "${YELLOW}Testing empty name...${NC}"
curl -s -X POST $BASE_URL/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"","description":"This should fail"}' \
  | jq '.error'
echo ""

echo -e "${GREEN}✅ API Test Complete!${NC}"
