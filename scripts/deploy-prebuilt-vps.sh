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
KEEP_RELEASES="${KEEP_RELEASES:-5}"
SMOKE_BASE_URL="${SMOKE_BASE_URL:-https://kfarapp.com}"

if [[ "${SKIP_BUILD:-false}" == "true" ]]; then
  echo "[deploy-prebuilt] SKIP_BUILD=true; using latest artifact from $ROOT_DIR/.deploy"
else
  bash "$ROOT_DIR/scripts/build-standalone-release.sh"
fi

ARTIFACT_PATH="$(ls -t "$ROOT_DIR/.deploy"/kfar-release-*.tar.gz | head -n 1)"
if [[ -z "${ARTIFACT_PATH:-}" || ! -f "$ARTIFACT_PATH" ]]; then
  echo "[deploy-prebuilt] ERROR: no artifact found in $ROOT_DIR/.deploy"
  exit 1
fi

RELEASE_SHA="$(git rev-parse --short HEAD)"
RELEASE_ID="$(date +%Y%m%d-%H%M%S)-${RELEASE_SHA}"
REMOTE_ARTIFACT="${VPS_TMP_DIR}/$(basename "$ARTIFACT_PATH")"

echo "[deploy-prebuilt] Uploading artifact to $VPS_HOST..."
scp -o StrictHostKeyChecking=no "$ARTIFACT_PATH" "$VPS_HOST:$REMOTE_ARTIFACT"

echo "[deploy-prebuilt] Activating release $RELEASE_ID on VPS..."
ssh -o StrictHostKeyChecking=no "$VPS_HOST" \
  "RELEASE_ID='$RELEASE_ID' \
   VPS_APP_SOURCE_DIR='$VPS_APP_SOURCE_DIR' \
   VPS_RELEASES_DIR='$VPS_RELEASES_DIR' \
   VPS_CURRENT_LINK='$VPS_CURRENT_LINK' \
   VPS_PORT='$VPS_PORT' \
   KEEP_RELEASES='$KEEP_RELEASES' \
   REMOTE_ARTIFACT='$REMOTE_ARTIFACT' \
   bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

release_dir="${VPS_RELEASES_DIR}/${RELEASE_ID}"
previous_release="$(readlink -f "$VPS_CURRENT_LINK" 2>/dev/null || true)"

rollback_current() {
  if [[ -n "${previous_release:-}" && -d "$previous_release" ]]; then
    echo "[deploy-prebuilt] Rolling back to $previous_release"
    ln -sfn "$previous_release" "$VPS_CURRENT_LINK"
    pm2 delete kfar >/dev/null 2>&1 || true
    pm2 start "$VPS_CURRENT_LINK/ecosystem.config.js" --only kfar --update-env || true
    pm2 save || true
  else
    echo "[deploy-prebuilt] No previous release available for rollback"
  fi
}

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
    kill_timeout: app.kill_timeout || 10000,
    listen_timeout: app.listen_timeout || 10000,
    env: {
      ...(app.env || {}),
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0',
      PORT: String(port),
      KFAR_UPLOAD_DIR: (app.env && app.env.KFAR_UPLOAD_DIR) || '/opt/kfar-uploads',
    },
  };

  delete cloned.args;
  return cloned;
});

fs.writeFileSync(targetPath, `module.exports = ${JSON.stringify({ apps: clonedApps }, null, 2)};\n`);
NODE

ln -sfn "$release_dir" "$VPS_CURRENT_LINK"
mkdir -p /opt/kfar-uploads/vendor-products

if pm2 describe kfar >/dev/null 2>&1; then
  pm2 delete kfar
fi

if ! pm2 start "$VPS_CURRENT_LINK/ecosystem.config.js" --only kfar --update-env; then
  rollback_current
  exit 1
fi
pm2 save

health_url="http://127.0.0.1:${VPS_PORT}/api/health"
for attempt in {1..60}; do
  health_json=""
  if health_json="$(curl -fsS --max-time 5 "$health_url" 2>/dev/null)" \
    && printf '%s' "$health_json" | grep -q '"db":true'; then
    echo "[deploy-prebuilt] DB-ready health check passed on attempt $attempt"
    break
  fi

  if [[ "$attempt" == "60" ]]; then
    echo "[deploy-prebuilt] ERROR: DB-ready health check failed after 60 seconds"
    if [[ -n "$health_json" ]]; then
      echo "[deploy-prebuilt] Last health response: $health_json"
    fi
    pm2 status kfar || true
    pm2 logs kfar --lines 80 --nostream || true
    rollback_current
    exit 1
  fi

  if [[ "$attempt" == "1" || "$attempt" == "10" || "$attempt" == "30" ]]; then
    echo "[deploy-prebuilt] Waiting for DB-ready health on attempt $attempt"
  fi

  sleep 1
done

if [[ -d /var/cache/nginx/kfar ]]; then
  find /var/cache/nginx/kfar -type f -delete
  echo "[deploy-prebuilt] Cleared nginx KFAR cache"
fi

keep_releases="${KEEP_RELEASES:-5}"
ls -1dt "$VPS_RELEASES_DIR"/* 2>/dev/null | tail -n +"$((keep_releases + 1))" | xargs -r rm -rf
rm -f "$REMOTE_ARTIFACT"
REMOTE_SCRIPT

echo "[deploy-prebuilt] Running live smoke checks..."
if ! SMOKE_BASE_URL="$SMOKE_BASE_URL" node "$ROOT_DIR/scripts/smoke-vps.mjs"; then
  echo "[deploy-prebuilt] ERROR: live smoke checks failed; attempting rollback"
  ssh -o StrictHostKeyChecking=no "$VPS_HOST" \
    "VPS_RELEASES_DIR='$VPS_RELEASES_DIR' \
     VPS_CURRENT_LINK='$VPS_CURRENT_LINK' \
     bash -s" <<'ROLLBACK_SCRIPT'
set -euo pipefail

previous_release="$(ls -1dt "$VPS_RELEASES_DIR"/* 2>/dev/null | sed -n '2p')"
if [[ -z "${previous_release:-}" || ! -d "$previous_release" ]]; then
  echo "[deploy-prebuilt] No previous release found for smoke-test rollback"
  exit 1
fi

echo "[deploy-prebuilt] Rolling back to $previous_release"
ln -sfn "$previous_release" "$VPS_CURRENT_LINK"
pm2 delete kfar >/dev/null 2>&1 || true
pm2 start "$VPS_CURRENT_LINK/ecosystem.config.js" --only kfar --update-env
pm2 save

if [[ -d /var/cache/nginx/kfar ]]; then
  find /var/cache/nginx/kfar -type f -delete
fi
ROLLBACK_SCRIPT
  exit 1
fi

echo "[deploy-prebuilt] Done."
