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

NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
NPM_BIN="${NPM_BIN:-$(command -v npm || true)}"

if [[ -z "$NODE_BIN" ]]; then
  echo "[build-release] ERROR: node is required but was not found on PATH"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  if [[ -z "$NPM_BIN" ]]; then
    echo "[build-release] ERROR: node_modules is missing and npm was not found on PATH"
    exit 1
  fi
  echo "[build-release] Installing dependencies with npm ci..."
  "$NPM_BIN" ci --no-audit --no-fund
fi

echo "[build-release] Verifying live data source guard..."
"$NODE_BIN" scripts/guard-live-data-source.mjs

if [[ "${SKIP_NEXT_BUILD:-false}" == "true" ]]; then
  echo "[build-release] SKIP_NEXT_BUILD=true; using existing .next/standalone output..."
else
  echo "[build-release] Building standalone Next.js output..."
  if [[ -n "$NPM_BIN" ]]; then
    NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}" "$NPM_BIN" run build:standalone
  else
    NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}" "$NODE_BIN" node_modules/next/dist/bin/next build --no-lint
  fi
fi

if [[ ! -f .next/standalone/server.js ]]; then
  echo "[build-release] ERROR: .next/standalone/server.js was not produced"
  exit 1
fi

rm -rf "$RELEASE_ROOT"
mkdir -p "$RELEASE_ROOT/.next"

echo "[build-release] Staging release files..."
cp -R .next/standalone/. "$RELEASE_ROOT/"
rm -rf "$RELEASE_ROOT/.next/static" "$RELEASE_ROOT/public"
cp -R .next/static "$RELEASE_ROOT/.next/static"
mkdir -p "$RELEASE_ROOT/public"
cp -R public/. "$RELEASE_ROOT/public/"
git rev-parse HEAD > "$RELEASE_ROOT/REVISION"

if [[ -n "$NPM_BIN" ]]; then
  SHARP_VERSION="$("$NODE_BIN" - <<'NODE'
const lock = require('./package-lock.json');
process.stdout.write(lock.packages?.['node_modules/sharp']?.version || '0.34.5');
NODE
  )"
  SHARP_LIBVIPS_VERSION="$("$NODE_BIN" - <<'NODE'
const lock = require('./package-lock.json');
process.stdout.write(lock.packages?.['node_modules/@img/sharp-libvips-linux-x64']?.version || '1.2.4');
NODE
  )"
  SHARP_RUNTIME_DIR="$DEPLOY_DIR/sharp-linux-runtime"
  echo "[build-release] Installing Linux sharp runtime for VPS uploads..."
  rm -rf "$SHARP_RUNTIME_DIR"
  mkdir -p "$SHARP_RUNTIME_DIR"
  printf '{"private":true}\n' > "$SHARP_RUNTIME_DIR/package.json"
  "$NPM_BIN" install --prefix "$SHARP_RUNTIME_DIR" --no-save --no-package-lock --no-audit --no-fund --force \
    "@img/sharp-linux-x64@${SHARP_VERSION}" \
    "@img/sharp-libvips-linux-x64@${SHARP_LIBVIPS_VERSION}"
  mkdir -p "$RELEASE_ROOT/node_modules/@img"
  cp -R "$SHARP_RUNTIME_DIR/node_modules/@img/sharp-linux-x64" "$RELEASE_ROOT/node_modules/@img/"
  cp -R "$SHARP_RUNTIME_DIR/node_modules/@img/sharp-libvips-linux-x64" "$RELEASE_ROOT/node_modules/@img/"
fi

ARTIFACT_SHA="$(git rev-parse --short HEAD)"
ARTIFACT_NAME="kfar-release-${ARTIFACT_SHA}.tar.gz"
ARTIFACT_PATH="$DEPLOY_DIR/$ARTIFACT_NAME"

rm -f "$ARTIFACT_PATH"
tar -C "$RELEASE_ROOT" -czf "$ARTIFACT_PATH" .

echo "[build-release] Artifact ready: $ARTIFACT_PATH"
