#!/usr/bin/env python3
import requests
import json
import base64

API_URL = "http://localhost:8080/api/listings"

# Small test image
small_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Create larger image by repeating
large_img = small_img * 500  # ~50KB

print("Testing with large image (~50KB)...")
payload = {
    "title": "Test Large Image",
    "price": 50.00,
    "description": "Test",
    "category": "Other",
    "condition": "Good",
    "imageUrl": f"data:image/png;base64,{large_img}"
}

try:
    r = requests.post(API_URL, json=payload, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 201:
        print("✅ Success!")
        print(json.dumps(r.json(), indent=2))
    else:
        print("❌ Error:")
        print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
