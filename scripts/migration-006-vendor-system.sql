-- Migration 006: vendor owner system support
-- Idempotent schema for DB-backed vendor banner management.

CREATE TABLE IF NOT EXISTS vendor_banners (
  id VARCHAR(80) PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  template VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_position INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_banners_vendor ON vendor_banners(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_banners_active ON vendor_banners(vendor_id, is_active, order_position);

GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_banners TO kfar;

CREATE TABLE IF NOT EXISTS vendor_customer_scans (
  id VARCHAR(80) PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_vendor_customer_scans_vendor ON vendor_customer_scans(vendor_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_customer_scans_customer ON vendor_customer_scans(customer_id, scanned_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_customer_scans TO kfar;
