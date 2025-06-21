-- KFAR Marketplace Production Database Migration
-- For DigitalOcean Managed Database

-- Enable UUID extension if using PostgreSQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create main tables
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_path VARCHAR(500),
  banner_path VARCHAR(500),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_he VARCHAR(255),
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  description_he TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'ILS',
  
  -- Image fields
  image_path VARCHAR(500),
  image_verified BOOLEAN DEFAULT FALSE,
  vision_enhanced BOOLEAN DEFAULT FALSE,
  vision_confidence DECIMAL(5, 2),
  
  -- Product attributes
  in_stock BOOLEAN DEFAULT TRUE,
  is_vegan BOOLEAN DEFAULT TRUE,
  is_kosher BOOLEAN DEFAULT FALSE,
  is_organic BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  
  -- Enhanced data
  features JSON,
  allergens JSON,
  certifications JSON,
  tags JSON,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendor_id),
  INDEX idx_category (category),
  INDEX idx_verified (image_verified)
);

-- Insert vendors
INSERT INTO vendors (id, name, slug, description, category) VALUES
('teva-deli', 'Teva Deli', 'teva-deli', 'Premium vegan deli specializing in plant-based meats', 'Food Manufacturing'),
('people-store', 'People Store', 'people-store', 'Community grocery with bulk foods and local products', 'Retail'),
('garden-of-light', 'Garden of Light', 'garden-of-light', 'Organic vegan products and spiritual foods', 'Organic Foods'),
('queens-cuisine', 'Queen''s Cuisine', 'queens-cuisine', 'Gourmet vegan catering and prepared meals', 'Catering'),
('gahn-delight', 'Gahn Delight', 'gahn-delight', 'Artisanal vegan ice cream and frozen desserts', 'Desserts'),
('vop-shop', 'VOP Shop', 'vop-shop', 'Village of Peace merchandise and community products', 'Merchandise')
ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_search ON products(name, description);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(in_stock, vendor_id);

-- Create view for easy querying
CREATE OR REPLACE VIEW products_with_vendors AS
SELECT 
  p.*,
  v.name as vendor_name,
  v.logo_path as vendor_logo,
  v.category as vendor_category
FROM products p
JOIN vendors v ON p.vendor_id = v.id
WHERE p.in_stock = TRUE AND v.is_active = TRUE;
