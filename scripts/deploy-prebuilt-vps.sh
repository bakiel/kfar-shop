#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

VPS_HOST="${VPS_HOST:-root@72.61.201.237}"
VPS_APP_SOURCE_DIR="${VPS_APP_SOURCE_DIR:-/opt/kfar}"
VPS_RELEASES_DIR="${VPS_RELEASES_DIR:-/opt/kfar-releases}"
VPS_CURRENT_LINK="${VPS_CURRENT_LINK:-/opt/kfar-live}"
VPS_TMP_DIR="${VPS_TMP_DIR:-/root}"
VPS_PORT="${VPS_PORT:-3006}"
VPS_NGINX_CACHE_DIR="${VPS_NGINX_CACHE_DIR:-/var/cache/nginx/kfar}"

bash "$ROOT_DIR/scripts/build-standalone-release.sh"

ARTIFACT_PATH="$(ls -t "$ROOT_DIR/.deploy"/kfar-release-*.tar.gz | head -n 1)"
if [[ -z "${ARTIFACT_PATH:-}" || ! -f "$ARTIFACT_PATH" ]]; then
  echo "[deploy-prebuilt] ERROR: no artifact found in $ROOT_DIR/.deploy"
  exit 1
fi

RELEASE_SHA="$(git rev-parse --short HEAD)"
RELEASE_ID="$(date +%Y%m%d-%H%M%S)-${RELEASE_SHA}"
REMOTE_ARTIFACT="${VPS_TMP_DIR}/$(basename "$ARTIFACT_PATH")"

echo "[deploy-prebuilt] Uploading artifact to $VPS_HOST..."
ssh -o StrictHostKeyChecking=no "$VPS_HOST" "cat > '$REMOTE_ARTIFACT'" < "$ARTIFACT_PATH"

echo "[deploy-prebuilt] Activating release $RELEASE_ID on VPS..."
ssh -o StrictHostKeyChecking=no "$VPS_HOST" \
  "RELEASE_ID='$RELEASE_ID' \
   VPS_APP_SOURCE_DIR='$VPS_APP_SOURCE_DIR' \
   VPS_RELEASES_DIR='$VPS_RELEASES_DIR' \
   VPS_CURRENT_LINK='$VPS_CURRENT_LINK' \
   VPS_PORT='$VPS_PORT' \
   VPS_NGINX_CACHE_DIR='$VPS_NGINX_CACHE_DIR' \
   REMOTE_ARTIFACT='$REMOTE_ARTIFACT' \
   bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

release_dir="${VPS_RELEASES_DIR}/${RELEASE_ID}"

mkdir -p "$VPS_RELEASES_DIR"
rm -rf "$release_dir"
mkdir -p "$release_dir"
tar -xzf "$REMOTE_ARTIFACT" -C "$release_dir"

node - "$VPS_APP_SOURCE_DIR/ecosystem.config.js" "$release_dir/ecosystem.config.js" "$release_dir" "$VPS_PORT" <<'NODE'
const fs = require('fs');
const sourcePath = process.argv[2];
const targetPath = process.argv[3];
const releaseDir = process.argv[4];
const port = process.argv[5];

const source = require(sourcePath);
const apps = Array.isArray(source.apps) ? source.apps : [source];
const clonedApps = apps.map((app) => {
  const cloned = {
    ...app,
    script: 'server.js',
    cwd: releaseDir,
    env: {
      ...(app.env || {}),
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0',
      PORT: String(port),
    },
  };

  delete cloned.args;
  return cloned;
});

fs.writeFileSync(targetPath, `module.exports = ${JSON.stringify({ apps: clonedApps }, null, 2)};\n`);
NODE

ln -sfn "$release_dir" "$VPS_CURRENT_LINK"

if pm2 describe kfar >/dev/null 2>&1; then
  pm2 delete kfar
fi

pm2 start "$VPS_CURRENT_LINK/ecosystem.config.js" --only kfar --update-env
pm2 save

for attempt in $(seq 1 15); do
  if curl -fsS "http://127.0.0.1:${VPS_PORT}/api/health" >/dev/null; then
    break
  fi

  if [[ "$attempt" -eq 15 ]]; then
    echo "[deploy-prebuilt] ERROR: app failed health check on port ${VPS_PORT}"
    exit 1
  fi

  sleep 2
done

if [[ -d "$VPS_NGINX_CACHE_DIR" ]]; then
  find "$VPS_NGINX_CACHE_DIR" -mindepth 1 -delete
fi

ls -1dt "$VPS_RELEASES_DIR"/* 2>/dev/null | tail -n +4 | xargs -r rm -rf
rm -f "$REMOTE_ARTIFACT"
REMOTE_SCRIPT

echo "[deploy-prebuilt] Verifying live site..."
curl -fsS "https://kfarapp.com/api/health" >/dev/null
curl -fsS "https://kfarapp.com/marketplace" >/dev/null

echo "[deploy-prebuilt] Done."
