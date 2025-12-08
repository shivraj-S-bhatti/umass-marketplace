#!/bin/bash

# Test with a larger base64 image to reproduce the 500 error
API_URL="http://localhost:8080/api/listings"

# Create a larger base64 image (simulating a real photo)
# This is a 100x100 PNG with more data (~5KB base64)
LARGE_IMAGE_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Generate a larger base64 string (repeat the small image data to simulate larger image)
# This creates about 50KB of base64 data
LARGE_BASE64=$(python3 -c "
import base64
# Create a larger base64 string by repeating
small = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
large = small * 500  # Repeat 500 times = ~50KB
print(large)
" 2>/dev/null || echo "$LARGE_IMAGE_BASE64")

echo "Testing with larger image (~50KB base64)..."
echo "Image size: ${#LARGE_BASE64} characters"

RESPONSE=$(curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Large Image\",
    \"price\": 50.00,
    \"description\": \"Test with large base64 image\",
    \"category\": \"Other\",
    \"condition\": \"Good\",
    \"imageUrl\": \"data:image/png;base64,$LARGE_BASE64\"
  }" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -s)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Success!"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo "❌ Error occurred:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi
