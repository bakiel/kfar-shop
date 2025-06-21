-- Initial Schema for KFAR Marketplace
-- This migration creates all necessary tables for the marketplace

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bulk pricing table
CREATE TABLE IF NOT EXISTS bulk_pricing (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription options table
CREATE TABLE IF NOT EXISTS subscription_options (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  frequency VARCHAR(50) NOT NULL, -- weekly, bi-weekly, monthly
  discount_percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor operating hours
CREATE TABLE IF NOT EXISTS vendor_hours (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer registrations (from coming soon page)
CREATE TABLE IF NOT EXISTS customer_registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50),
  source VARCHAR(50) DEFAULT 'website',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

-- Vendor registrations (from coming soon page)
CREATE TABLE IF NOT EXISTS vendor_registrations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  business_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  business_type VARCHAR(100),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_date ON vendor_analytics(vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(product_id, date);

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

-- Create RPC function for incrementing product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_audit_log ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust based on your auth strategy)
-- Allow public read access to active vendors and products
CREATE POLICY "Public vendors are viewable by everyone" 
  ON vendors FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Published products are viewable by everyone" 
  ON products FOR SELECT 
  USING (status = 'published');

-- Vendors can manage their own data
CREATE POLICY "Vendors can view their own analytics" 
  ON vendor_analytics FOR SELECT 
  USING (vendor_id = auth.uid()::text);

CREATE POLICY "Vendors can view their own audit logs" 
  ON vendor_audit_log FOR SELECT 
  USING (vendor_id = auth.uid()::text);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to vendors" 
  ON vendors FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to products" 
  ON products FOR ALL 
  USING (auth.role() = 'service_role');