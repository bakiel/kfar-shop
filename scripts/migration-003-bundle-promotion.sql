-- Migration 003: Home-page bundle promotion slot
-- Apply on VPS:  sudo -u postgres psql kfar_marketplace -f migration-003-bundle-promotion.sql

BEGIN;

-- Single-row "promoted bundle" surface on the marketplace home page.
-- Only one bundle may be promoted at a time; the admin API enforces
-- this by clearing the flag on all other rows when a new one is set.
ALTER TABLE bundles
  ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_bundles_is_promoted
  ON bundles(is_promoted) WHERE is_promoted = true;

COMMIT;
