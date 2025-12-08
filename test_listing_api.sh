#!/bin/bash

# Test script to create a listing with image data via API
# This will help diagnose the 500 error

API_URL="http://localhost:8080/api/listings"

# Create a small base64 encoded image (1x1 red pixel PNG)
# This is a minimal valid PNG image
SMALL_IMAGE_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Create a larger base64 image (small test image - about 500 bytes when base64 encoded)
MEDIUM_IMAGE_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVBiVY/z//z8DJYAFiAOAuAqI64G4AYibgLgZiFuAuBWIO4C4C4i7gbgHiPuAeACIB4F4CIiHgXgEiEeBeAyIx4F4Aogn"
# Truncated for brevity - using small image instead

echo "Testing listing creation without image..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Item Without Image",
    "price": 10.00,
    "description": "Test description",
    "category": "Other",
    "condition": "Good"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received"

echo -e "\n\nTesting listing creation with small base64 image..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Item With Image\",
    \"price\": 20.00,
    \"description\": \"Test description with image\",
    \"category\": \"Other\",
    \"condition\": \"Good\",
    \"imageUrl\": \"data:image/png;base64,$SMALL_IMAGE_BASE64\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received"

echo -e "\n\nTesting with just base64 (no data URI prefix)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Item Base64 Only\",
    \"price\": 30.00,
    \"description\": \"Test with base64 only\",
    \"category\": \"Other\",
    \"condition\": \"Good\",
    \"imageUrl\": \"$SMALL_IMAGE_BASE64\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received"

echo -e "\n\nDone testing."
