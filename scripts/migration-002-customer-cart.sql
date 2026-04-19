-- Migration 002: Persistent shopping list (customer cart) + reorder support
-- Apply on VPS:  sudo -u postgres psql kfar_marketplace -f migration-002-customer-cart.sql

BEGIN;

-- Persistent cart / shopping list, one row per authenticated customer.
-- Guests continue to use localStorage-only cart in CartContext.
CREATE TABLE IF NOT EXISTS customer_carts (
  customer_id   UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  items         JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_carts_updated_at
  ON customer_carts(updated_at DESC);

COMMIT;
