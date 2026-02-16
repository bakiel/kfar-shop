#!/bin/bash
# KFAR Image Cache Warmer
# Run on VPS after deploy to pre-optimize all product images
# Usage: bash scripts/warm-image-cache.sh

set -e

BASE="http://localhost:3006"
API="$BASE/api/products-db"
WIDTHS="384 640 828"  # Common Next.js image widths

echo "=== KFAR Image Cache Warmer ==="
echo "Fetching product image list..."

# Get all unique image URLs from API
IMAGES=$(curl -s "$API" | python3 -c "
import sys, json
d = json.load(sys.stdin)
seen = set()
for p in d.get('products', []):
    img = p.get('image', '')
    if img and img not in seen:
        seen.add(img)
        print(img)
")

COUNT=$(echo "$IMAGES" | wc -l | tr -d ' ')
echo "Found $COUNT unique product images"
echo "Warming cache at widths: $WIDTHS"
echo ""

DONE=0
ERRORS=0

for img in $IMAGES; do
    for w in $WIDTHS; do
        URL="$BASE/_next/image?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$img'))")&w=$w&q=75"
        HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$URL" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" != "200" ]; then
            ERRORS=$((ERRORS + 1))
        fi
    done
    DONE=$((DONE + 1))
    if [ $((DONE % 20)) -eq 0 ] || [ "$DONE" -eq "$COUNT" ]; then
        echo "  Progress: $DONE/$COUNT images ($ERRORS errors)"
    fi
done

echo ""
echo "=== Done: $DONE images warmed, $ERRORS errors ==="
