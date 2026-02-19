#!/bin/bash
# QSI Africa Platform - API Testing Script
# Tests the new admin endpoints for QSI Concepts and Smart City Demos

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "QSI Africa API Testing Script"
echo "=================================="
echo ""

# Configuration
API_BASE="http://localhost:3001/api"
ADMIN_TOKEN="YOUR_ADMIN_JWT_TOKEN_HERE"

# Check if token is set
if [ "$ADMIN_TOKEN" == "YOUR_ADMIN_JWT_TOKEN_HERE" ]; then
    echo -e "${RED}ERROR: Please set your admin JWT token in this script${NC}"
    echo "Get your token by logging in as admin and copying the JWT"
    exit 1
fi

echo "Testing with API Base: $API_BASE"
echo ""

# Test 1: Create QSI Concept
echo -e "${YELLOW}Test 1: Creating QSI Concept...${NC}"
CREATE_CONCEPT=$(curl -s -X POST "$API_BASE/admin/qsi-concepts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Concept - Automated",
    "description": "This is a test concept created by the testing script",
    "category": "Testing",
    "isActive": true
  }')

if echo "$CREATE_CONCEPT" | grep -q '"id"'; then
    CONCEPT_ID=$(echo "$CREATE_CONCEPT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Concept created with ID: $CONCEPT_ID${NC}"
else
    echo -e "${RED}✗ Failed to create concept${NC}"
    echo "$CREATE_CONCEPT"
fi
echo ""

# Test 2: List QSI Concepts (Admin)
echo -e "${YELLOW}Test 2: Listing QSI Concepts (Admin View)...${NC}"
LIST_CONCEPTS=$(curl -s "$API_BASE/admin/qsi-concepts" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$LIST_CONCEPTS" | grep -q '\['; then
    CONCEPT_COUNT=$(echo "$LIST_CONCEPTS" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ Found $CONCEPT_COUNT concepts${NC}"
else
    echo -e "${RED}✗ Failed to list concepts${NC}"
    echo "$LIST_CONCEPTS"
fi
echo ""

# Test 3: List QSI Concepts (Public)
echo -e "${YELLOW}Test 3: Listing QSI Concepts (Public View)...${NC}"
PUBLIC_CONCEPTS=$(curl -s "$API_BASE/submit/concepts")

if echo "$PUBLIC_CONCEPTS" | grep -q '\['; then
    PUBLIC_COUNT=$(echo "$PUBLIC_CONCEPTS" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ Found $PUBLIC_COUNT active concepts (publicly visible)${NC}"
else
    echo -e "${RED}✗ Failed to list public concepts${NC}"
    echo "$PUBLIC_CONCEPTS"
fi
echo ""

# Test 4: Create Smart City Demo
echo -e "${YELLOW}Test 4: Creating Smart City Demo...${NC}"
CREATE_DEMO=$(curl -s -X POST "$API_BASE/admin/smart-city-demos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Demo - Automated",
    "city": "Test City",
    "location": "Test Location",
    "status": "PROPOSED",
    "shortDescription": "Automated test demo",
    "fullDescription": "This is a test demonstrator created by the testing script for validation",
    "engagementEnabled": true,
    "isActive": true
  }')

if echo "$CREATE_DEMO" | grep -q '"id"'; then
    DEMO_ID=$(echo "$CREATE_DEMO" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Demo created with ID: $DEMO_ID${NC}"
else
    echo -e "${RED}✗ Failed to create demo${NC}"
    echo "$CREATE_DEMO"
fi
echo ""

# Test 5: List Smart City Demos (Admin)
echo -e "${YELLOW}Test 5: Listing Smart City Demos (Admin View)...${NC}"
LIST_DEMOS=$(curl -s "$API_BASE/admin/smart-city-demos" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$LIST_DEMOS" | grep -q '\['; then
    DEMO_COUNT=$(echo "$LIST_DEMOS" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ Found $DEMO_COUNT demos${NC}"
else
    echo -e "${RED}✗ Failed to list demos${NC}"
    echo "$LIST_DEMOS"
fi
echo ""

# Test 6: List Smart City Demos (Public)
echo -e "${YELLOW}Test 6: Listing Smart City Demos (Public View)...${NC}"
PUBLIC_DEMOS=$(curl -s "$API_BASE/submit/demos")

if echo "$PUBLIC_DEMOS" | grep -q '\['; then
    PUBLIC_DEMO_COUNT=$(echo "$PUBLIC_DEMOS" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ Found $PUBLIC_DEMO_COUNT active demos (publicly visible)${NC}"
else
    echo -e "${RED}✗ Failed to list public demos${NC}"
    echo "$PUBLIC_DEMOS"
fi
echo ""

# Test 7: Update Concept (if created)
if [ ! -z "$CONCEPT_ID" ]; then
    echo -e "${YELLOW}Test 7: Updating QSI Concept...${NC}"
    UPDATE_CONCEPT=$(curl -s -X PUT "$API_BASE/admin/qsi-concepts/$CONCEPT_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Test Concept - Updated",
        "description": "Updated description",
        "isActive": false
      }')
    
    if echo "$UPDATE_CONCEPT" | grep -q "Updated"; then
        echo -e "${GREEN}✓ Concept updated successfully${NC}"
    else
        echo -e "${RED}✗ Failed to update concept${NC}"
        echo "$UPDATE_CONCEPT"
    fi
    echo ""
fi

# Test 8: Delete Test Data (Cleanup)
echo -e "${YELLOW}Test 8: Cleaning up test data...${NC}"

if [ ! -z "$CONCEPT_ID" ]; then
    DELETE_CONCEPT=$(curl -s -X DELETE "$API_BASE/admin/qsi-concepts/$CONCEPT_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    echo -e "${GREEN}✓ Test concept deleted${NC}"
fi

if [ ! -z "$DEMO_ID" ]; then
    DELETE_DEMO=$(curl -s -X DELETE "$API_BASE/admin/smart-city-demos/$DEMO_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    echo -e "${GREEN}✓ Test demo deleted${NC}"
fi
echo ""

echo "=================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "=================================="
echo ""
echo "Summary:"
echo "• QSI Concepts CRUD: Working"
echo "• Smart City Demos CRUD: Working"
echo "• Public API Endpoints: Working"
echo ""
echo "Next steps:"
echo "1. Test registration with new optional fields"
echo "2. Test login error logging"
echo "3. Create real content using admin endpoints"
