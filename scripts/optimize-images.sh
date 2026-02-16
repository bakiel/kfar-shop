#!/bin/bash
# KFAR Image Optimization Script
# Compresses all product images to web-friendly sizes
# Run: bash scripts/optimize-images.sh [--dry-run]

set -e

IMAGE_DIR="public/images"
MAX_WIDTH=1200
MAX_HEIGHT=1200
QUALITY=82
MAX_FILE_SIZE_KB=200  # Target: all images under 200KB

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo "DRY RUN - no changes will be made"
fi

# Check for ImageMagick
if ! command -v mogrify &>/dev/null; then
    echo "ERROR: ImageMagick not installed. Install with:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: apt install imagemagick"
    exit 1
fi

echo "=== KFAR Image Optimizer ==="
echo "Directory: $IMAGE_DIR"
echo "Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}"
echo "Quality: $QUALITY"
echo "Max file size: ${MAX_FILE_SIZE_KB}KB"
echo ""

# Count images
TOTAL=$(find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l | tr -d ' ')
OVERSIZED=$(find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +${MAX_FILE_SIZE_KB}k | wc -l | tr -d ' ')
BEFORE_SIZE=$(du -sh "$IMAGE_DIR" 2>/dev/null | cut -f1)

echo "Total images: $TOTAL"
echo "Over ${MAX_FILE_SIZE_KB}KB: $OVERSIZED"
echo "Current size: $BEFORE_SIZE"
echo ""

if [ "$OVERSIZED" -eq 0 ]; then
    echo "All images are already optimized!"
    exit 0
fi

COMPRESSED=0
SAVED_BYTES=0

find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +${MAX_FILE_SIZE_KB}k | while read -r file; do
    BEFORE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    BEFORE_KB=$((BEFORE / 1024))

    if [ "$DRY_RUN" = true ]; then
        echo "  Would compress: $(basename "$file") (${BEFORE_KB}KB)"
    else
        # Strip metadata, resize if needed, compress
        mogrify -strip -quality $QUALITY -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" "$file"

        AFTER=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        AFTER_KB=$((AFTER / 1024))
        SAVED=$((BEFORE - AFTER))

        echo "  $(basename "$file"): ${BEFORE_KB}KB -> ${AFTER_KB}KB (saved $((SAVED / 1024))KB)"
    fi
done

AFTER_SIZE=$(du -sh "$IMAGE_DIR" 2>/dev/null | cut -f1)
echo ""
echo "=== DONE ==="
echo "Before: $BEFORE_SIZE"
echo "After: $AFTER_SIZE"
echo ""
echo "Next: commit and deploy to VPS"
