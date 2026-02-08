-- Sample products for KFAR Shop vendors
-- This script adds sample products for testing

-- Get vendor IDs
DO $$
DECLARE
    fresh_harvest_id UUID;
    green_gardens_id UUID;
BEGIN
    -- Get Fresh Harvest vendor ID
    SELECT id INTO fresh_harvest_id FROM vendors WHERE business_name = 'Fresh Harvest' LIMIT 1;
    
    -- Get Green Gardens vendor ID
    SELECT id INTO green_gardens_id FROM vendors WHERE business_name = 'Green Gardens' LIMIT 1;
    
    -- Add products for Fresh Harvest if vendor exists
    IF fresh_harvest_id IS NOT NULL THEN
        INSERT INTO products (vendor_id, name, description, price, unit, category, subcategory, stock_quantity, is_available, images)
        VALUES 
        (fresh_harvest_id, 'Organic Tomatoes', 'Fresh, locally grown organic tomatoes', 12.50, 'kg', 'Vegetables', 'Fresh Produce', 50, true, ARRAY['https://images.unsplash.com/photo-1546094096-0df4bcaaa337']),
        (fresh_harvest_id, 'Sweet Bell Peppers', 'Colorful mix of red, yellow, and orange peppers', 18.00, 'kg', 'Vegetables', 'Fresh Produce', 30, true, ARRAY['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83']),
        (fresh_harvest_id, 'Organic Cucumbers', 'Crisp and fresh organic cucumbers', 8.50, 'kg', 'Vegetables', 'Fresh Produce', 40, true, ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e']),
        (fresh_harvest_id, 'Fresh Lettuce', 'Crispy green lettuce, perfect for salads', 6.00, 'unit', 'Vegetables', 'Leafy Greens', 25, true, ARRAY['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1']),
        (fresh_harvest_id, 'Organic Carrots', 'Sweet and crunchy organic carrots', 7.50, 'kg', 'Vegetables', 'Root Vegetables', 60, true, ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37']);
    END IF;
    
    -- Add products for Green Gardens if vendor exists
    IF green_gardens_id IS NOT NULL THEN
        INSERT INTO products (vendor_id, name, description, price, unit, category, subcategory, stock_quantity, is_available, images)
        VALUES 
        (green_gardens_id, 'Herb Garden Kit', 'Complete kit with basil, parsley, and cilantro', 35.00, 'kit', 'Garden', 'Herb Kits', 15, true, ARRAY['https://images.unsplash.com/photo-1536882240095-0379873feb4e']),
        (green_gardens_id, 'Organic Fertilizer', 'Natural compost for healthy plants', 25.00, '5kg bag', 'Garden', 'Fertilizers', 40, true, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b']),
        (green_gardens_id, 'Tomato Seedlings', 'Ready-to-plant organic tomato seedlings', 8.00, 'plant', 'Garden', 'Seedlings', 50, true, ARRAY['https://images.unsplash.com/photo-1592841200221-a6898f307baa']),
        (green_gardens_id, 'Garden Tool Set', 'Essential tools for home gardening', 120.00, 'set', 'Garden', 'Tools', 10, true, ARRAY['https://images.unsplash.com/photo-1617576683096-00fc8eecb3af']),
        (green_gardens_id, 'Organic Seeds Mix', 'Variety pack of vegetable seeds', 45.00, 'pack', 'Garden', 'Seeds', 30, true, ARRAY['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2']);
    END IF;
    
    RAISE NOTICE 'Sample products added successfully!';
END $$;