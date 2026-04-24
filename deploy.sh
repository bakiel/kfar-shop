#!/bin/bash
set -e
cd /opt/kfar

echo "[deploy] Pulling latest code..."
git pull

echo "[deploy] Building..."
NODE_OPTIONS="--max-old-space-size=2048"   node_modules/.bin/next build 2>&1

echo "[deploy] Restarting PM2..."
pm2 startOrRestart ecosystem.config.js --only kfar

echo "[deploy] Waiting for startup..."
sleep 8

if curl -sf http://localhost:3006/ > /dev/null 2>&1; then
  pm2 save
  echo "[deploy] ✅ kfar is live on port 3006"
else
  echo "[deploy] ❌ Health check failed - check pm2 logs kfar"
  exit 1
fi
