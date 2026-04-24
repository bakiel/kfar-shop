#\!/bin/bash
# Post-build safety check for KFAR
# Prevents PM2 crash-loop when prerender-manifest.json is missing

NEXT_DIR="/opt/kfar/.next"

echo "=== KFAR Post-Build Safety Check ==="

# Check for prerender-manifest.json (crashes app if missing)
if [ \! -f "$NEXT_DIR/prerender-manifest.json" ]; then
  echo "WARNING: prerender-manifest.json missing, creating fallback..."
  python3 -c "
import secrets, json
manifest = {
  \"version\": 4,
  \"routes\": {},
  \"dynamicRoutes\": {},
  \"notFoundRoutes\": [],
  \"preview\": {
    \"previewModeId\": secrets.token_hex(16),
    \"previewModeSigningKey\": secrets.token_hex(32),
    \"previewModeEncryptionKey\": secrets.token_hex(32)
  }
}
with open(\"$NEXT_DIR/prerender-manifest.json\", \"w\") as f:
    json.dump(manifest, f)
print(\"Created prerender-manifest.json\")
"
else
  echo "prerender-manifest.json OK ($(python3 -c "import json; d=json.load(open(\"$NEXT_DIR/prerender-manifest.json\")); print(\"v\" + str(d.get(\"version\",\"?\")), str(len(d.get(\"routes\",{}))) + \" routes\")" 2>/dev/null || echo "exists"))"
fi

# Verify BUILD_ID exists
if [ \! -f "$NEXT_DIR/BUILD_ID" ]; then
  echo "ERROR: BUILD_ID missing - build may have failed\!"
  exit 1
fi
echo "BUILD_ID: $(cat $NEXT_DIR/BUILD_ID)"

# Verify app-build-manifest.json exists
if [ \! -f "$NEXT_DIR/app-build-manifest.json" ]; then
  echo "ERROR: app-build-manifest.json missing - build may have failed\!"
  exit 1
fi
echo "app-build-manifest.json OK"

# Verify build-manifest.json exists
if [ \! -f "$NEXT_DIR/build-manifest.json" ]; then
  echo "ERROR: build-manifest.json missing\!"
  exit 1
fi
echo "build-manifest.json OK"

echo "=== Post-build check PASSED ==="
