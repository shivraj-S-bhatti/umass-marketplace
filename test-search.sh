#!/bin/bash

# Test script for UMass Marketplace search functionality
# This script tests the search API endpoints to verify they work correctly

echo "🧪 Testing UMass Marketplace Search Functionality"
echo "================================================"

# Base URL for the API
BASE_URL="http://localhost:8080"

echo ""
echo "1. Testing basic search endpoint..."
curl -s "$BASE_URL/api/listings/test-search" | echo "   Response: $(cat)"

echo ""
echo "2. Testing search with query parameter..."
curl -s "$BASE_URL/api/listings/test-search?q=MacBook" | echo "   Response: $(cat)"

echo ""
echo "3. Testing search with empty query..."
curl -s "$BASE_URL/api/listings/test-search?q=" | echo "   Response: $(cat)"

echo ""
echo "4. Testing main listings endpoint (no filters)..."
curl -s "$BASE_URL/api/listings?page=0&size=5" | jq '.totalElements' 2>/dev/null || echo "   Response: $(curl -s "$BASE_URL/api/listings?page=0&size=5")"

echo ""
echo "5. Testing main listings endpoint with search query..."
curl -s "$BASE_URL/api/listings?q=MacBook&page=0&size=5" | jq '.totalElements' 2>/dev/null || echo "   Response: $(curl -s "$BASE_URL/api/listings?q=MacBook&page=0&size=5")"

echo ""
echo "6. Testing main listings endpoint with category filter..."
curl -s "$BASE_URL/api/listings?category=Electronics&page=0&size=5" | jq '.totalElements' 2>/dev/null || echo "   Response: $(curl -s "$BASE_URL/api/listings?category=Electronics&page=0&size=5")"

echo ""
echo "7. Testing main listings endpoint with empty search query..."
curl -s "$BASE_URL/api/listings?q=&page=0&size=5" | jq '.totalElements' 2>/dev/null || echo "   Response: $(curl -s "$BASE_URL/api/listings?q=&page=0&size=5")"

echo ""
echo "✅ Test completed! Check the API logs for debug information."
