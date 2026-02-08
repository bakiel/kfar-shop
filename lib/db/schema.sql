-- KFAR Marketplace Database Schema
-- PostgreSQL schema for self-managed marketplace

-- Drop existing tables if needed (be careful in production!)
-- DROP TABLE IF EXISTS vendor_audit_log CASCADE;
-- DROP TABLE IF EXISTS product_analytics CASCADE;
-- DROP TABLE IF EXISTS vendor_analytics CASCADE;
-- DROP TABLE IF EXISTS product_reviews CASCADE;
-- DROP TABLE IF EXISTS vendor_team CASCADE;
-- DROP TABLE IF EXISTS vendor_hours CASCADE;
-- DROP TABLE IF EXISTS subscription_options CASCADE;
-- DROP TABLE IF EXISTS bulk_pricing CASCADE;
-- DROP TABLE IF EXISTS product_variations CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS vendors CASCADE;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  
  -- Information
  description TEXT,
  short_description TEXT,
  established_year VARCHAR(4),
  location VARCHAR(255),
  address TEXT,
  
  -- Settings
  theme VARCHAR(50) DEFAULT 'modern',
  layout VARCHAR(50) DEFAULT 'grid',
  features TEXT[], -- Array of feature flags
  payment_methods TEXT[],
  shipping_methods TEXT[],
  return_policy TEXT,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Analytics
  total_products INTEGER DEFAULT 0,
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  certifications TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE,
  slug VARCHAR(255) NOT NULL,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  name_he VARCHAR(255),
  description TEXT,
  short_description TEXT,
  long_description TEXT,
  
  -- Categorization
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  tags TEXT[],
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'ILS',
  
  -- Inventory
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Media
  primary_image TEXT,
  image_gallery TEXT[],
  thumbnails TEXT[],
  video_urls TEXT[],
  
  -- Specifications
  weight DECIMAL(10,3),
  dimensions JSONB,
  specifications JSONB,
  nutritional_info JSONB,
  
  -- Features
  features TEXT[],
  benefits TEXT[],
  ingredients TEXT[],
  allergens TEXT[],
  certifications TEXT[],
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  is_featured BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT true,
  is_kosher BOOLEAN DEFAULT true,
  is_organic BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  
  -- Dates
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variations table
CREATE TABLE IF NOT EXISTS product_variations (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- size, color, flavor, etc
  value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk pricing table
CREATE TABLE IF NOT EXISTS bulk_pricing (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription options table
CREATE TABLE IF NOT EXISTS subscription_options (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  frequency VARCHAR(50) NOT NULL, -- weekly, bi-weekly, monthly
  discount_percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor operating hours
CREATE TABLE IF NOT EXISTS vendor_hours (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  UNIQUE(vendor_id, day_of_week)
);

-- Vendor team members
CREATE TABLE IF NOT EXISTS vendor_team (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  customer_id VARCHAR(50),
  customer_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor analytics
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  products_viewed INTEGER DEFAULT 0,
  add_to_cart_count INTEGER DEFAULT 0,
  checkout_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  UNIQUE(vendor_id, date)
);

-- Product analytics
CREATE TABLE IF NOT EXISTS product_analytics (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  add_to_cart_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  UNIQUE(product_id, date)
);

-- Audit log for vendor actions
CREATE TABLE IF NOT EXISTS vendor_audit_log (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
  user_id VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_date ON vendor_analytics(vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(product_id, date);
CREATE INDEX IF NOT EXISTS idx_audit_log_vendor ON vendor_audit_log(vendor_id, created_at);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();