-- KFAR Marketplace Database Schema with Vision Verification
-- For DigitalOcean MySQL/PostgreSQL

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_path VARCHAR(500),
  banner_path VARCHAR(500),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
);

-- Products table with vision verification
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  
  -- Image and vision fields
  image_path VARCHAR(500),
  image_verified BOOLEAN DEFAULT FALSE,
  vision_product_name VARCHAR(255),
  vision_description TEXT,
  vision_category VARCHAR(100),
  vision_confidence DECIMAL(5, 2),
  vision_last_analyzed TIMESTAMP NULL,
  vision_analyzer VARCHAR(50), -- 'claude', 'gemini', 'both'
  
  -- Stock management
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT NULL,
  
  -- Product attributes
  is_vegan BOOLEAN DEFAULT TRUE,
  is_kosher BOOLEAN DEFAULT FALSE,
  is_organic BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  tags JSON,
  nutritional_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendor_id),
  INDEX idx_slug (vendor_id, slug),
  INDEX idx_verified (image_verified),
  INDEX idx_category (category)
);

-- Vision audit log
CREATE TABLE IF NOT EXISTS vision_audits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50),
  image_path VARCHAR(500) NOT NULL,
  
  -- Vision analysis results
  claude_analysis JSON,
  gemini_analysis JSON,
  python_analysis JSON,
  
  -- Reconciled results
  final_product_name VARCHAR(255),
  final_description TEXT,
  final_category VARCHAR(100),
  final_confidence DECIMAL(5, 2),
  
  -- Matching results
  matched_to_product_id VARCHAR(50),
  match_score DECIMAL(5, 2),
  needs_manual_review BOOLEAN DEFAULT FALSE,
  
  -- Audit metadata
  audited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  audited_by VARCHAR(50),
  review_status ENUM('pending', 'approved', 'rejected', 'corrected') DEFAULT 'pending',
  review_notes TEXT,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_status (review_status),
  INDEX idx_confidence (final_confidence)
);

-- Image inventory table
CREATE TABLE IF NOT EXISTS image_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_path VARCHAR(500) UNIQUE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  mime_type VARCHAR(50),
  width INT,
  height INT,
  
  -- Classification
  image_type ENUM('product', 'vendor_logo', 'banner', 'placeholder', 'unknown') DEFAULT 'unknown',
  assigned_to_product_id VARCHAR(50),
  assigned_to_vendor_id VARCHAR(50),
  
  -- Quality assessment
  is_placeholder BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(5, 2),
  
  -- Metadata
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_verified TIMESTAMP NULL,
  
  FOREIGN KEY (assigned_to_product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  INDEX idx_type (image_type),
  INDEX idx_product_assignment (assigned_to_product_id)
);

-- Manual review queue
CREATE TABLE IF NOT EXISTS review_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  audit_id INT NOT NULL,
  priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
  
  -- Review data
  current_product_data JSON,
  suggested_product_data JSON,
  vision_results JSON,
  
  -- Review process
  assigned_to VARCHAR(100),
  review_started_at TIMESTAMP NULL,
  review_completed_at TIMESTAMP NULL,
  action_taken ENUM('approved', 'corrected', 'rejected', 'deferred'),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (audit_id) REFERENCES vision_audits(id) ON DELETE CASCADE,
  INDEX idx_priority (priority, created_at)
);

-- Product image mappings (for multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  image_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES image_inventory(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_image (product_id, image_id),
  INDEX idx_product (product_id)
);

-- Create initial vendors
INSERT INTO vendors (id, name, slug, description, category) VALUES
('teva-deli', 'Teva Deli', 'teva-deli', 'Premium vegan deli specializing in plant-based meats', 'Food Manufacturing'),
('garden-of-light', 'Garden of Light', 'garden-of-light', 'Organic vegan products and spiritual foods', 'Organic Foods'),
('queens-cuisine', 'Queen\'s Cuisine', 'queens-cuisine', 'Gourmet vegan catering and prepared meals', 'Catering'),
('people-store', 'People Store', 'people-store', 'Community grocery with bulk foods and local products', 'Retail'),
('gahn-delight', 'Gahn Delight', 'gahn-delight', 'Artisanal vegan ice cream and frozen desserts', 'Desserts'),
('vop-shop', 'VOP Shop', 'vop-shop', 'Village of Peace merchandise and community products', 'Merchandise')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Views for easier querying

-- Products with vision verification status
CREATE VIEW products_vision_status AS
SELECT 
  p.*,
  v.name as vendor_name,
  CASE 
    WHEN p.image_verified = TRUE THEN 'Verified'
    WHEN p.vision_confidence >= 80 THEN 'High Confidence'
    WHEN p.vision_confidence >= 50 THEN 'Medium Confidence'
    WHEN p.vision_confidence > 0 THEN 'Low Confidence'
    ELSE 'Not Analyzed'
  END as verification_status
FROM products p
JOIN vendors v ON p.vendor_id = v.id;

-- Images needing review
CREATE VIEW images_needing_review AS
SELECT 
  ii.*,
  va.final_confidence,
  va.needs_manual_review
FROM image_inventory ii
LEFT JOIN vision_audits va ON ii.file_path = va.image_path
WHERE ii.assigned_to_product_id IS NULL
   OR va.needs_manual_review = TRUE
   OR va.final_confidence < 50;