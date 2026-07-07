#!/bin/bash
# run-tests.sh

API_BASE="http://localhost:3001/api"
ADMIN_EMAIL="super@qsi.africa"
ADMIN_PASSWORD="SecurePassword123!"

echo "Logging in as Admin..."
LOGIN_RESP=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed. Response:"
    echo "$LOGIN_RESP"
    exit 1
fi

echo "Login successful! Got JWT token."

# Replace the placeholder in the test script or export the variable
sed -i "s/ADMIN_TOKEN=\"YOUR_ADMIN_JWT_TOKEN_HERE\"/ADMIN_TOKEN=\"$TOKEN\"/" test-admin-apis.sh

echo "Running test-admin-apis.sh..."
bash test-admin-apis.sh

# Revert the token placeholder to avoid committing secrets
sed -i "s/ADMIN_TOKEN=\"$TOKEN\"/ADMIN_TOKEN=\"YOUR_ADMIN_JWT_TOKEN_HERE\"/" test-admin-apis.sh
