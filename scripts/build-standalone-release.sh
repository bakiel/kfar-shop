#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_DIR="$ROOT_DIR/.deploy"
RELEASE_ROOT="$DEPLOY_DIR/release"

if [[ -z "${JWT_SECRET:-}" && -f "$ROOT_DIR/ecosystem.config.js" ]]; then
  echo "[build-release] Loading environment from ecosystem.config.js..."
  eval "$(
    node - <<'NODE'
const config = require('./ecosystem.config.js');
const apps = Array.isArray(config.apps) ? config.apps : [config];
const app = apps.find((entry) => entry.name === 'kfar') || apps[0] || {};
const env = app.env || {};

for (const [key, value] of Object.entries(env)) {
  if (typeof value === 'string') {
    process.stdout.write(`export ${key}=${JSON.stringify(value)}\n`);
  }
}
NODE
  )"
fi

if [[ ! -d node_modules ]]; then
  echo "[build-release] Installing dependencies with npm ci..."
  npm ci --no-audit --no-fund
fi

echo "[build-release] Building standalone Next.js output..."
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}" npm run build:standalone

if [[ ! -f .next/standalone/server.js ]]; then
  echo "[build-release] ERROR: .next/standalone/server.js was not produced"
  exit 1
fi

rm -rf "$RELEASE_ROOT"
mkdir -p "$RELEASE_ROOT/.next"

echo "[build-release] Staging release files..."
cp -R .next/standalone/. "$RELEASE_ROOT/"
cp -R .next/static "$RELEASE_ROOT/.next/static"
cp -R public "$RELEASE_ROOT/public"
git rev-parse HEAD > "$RELEASE_ROOT/REVISION"

ARTIFACT_SHA="$(git rev-parse --short HEAD)"
ARTIFACT_NAME="kfar-release-${ARTIFACT_SHA}.tar.gz"
ARTIFACT_PATH="$DEPLOY_DIR/$ARTIFACT_NAME"

rm -f "$ARTIFACT_PATH"
tar -C "$RELEASE_ROOT" -czf "$ARTIFACT_PATH" .

echo "[build-release] Artifact ready: $ARTIFACT_PATH"
