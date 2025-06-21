// Data Flow Configuration
export const DATA_SOURCES = {
  // Single source of truth
  MASTER_CATALOG: '/lib/data/wordpress-style-data-layer.ts',
  
  // API endpoints (all use master catalog)
  PRODUCTS_API: '/api/products-enhanced',
  VENDORS_API: '/api/vendors',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  VENDOR_ADMIN: '/admin/vendor/[vendorId]',
  
  // Frontend routes
  SHOP: '/shop',
  VENDOR_STORES: '/vendor/[vendorId]',
  PRODUCT_PAGES: '/product/[productId]'
};

// Ensure all components import from master catalog
export const DATA_IMPORT_RULES = {
  ALWAYS_USE: "import { vendorStores, getAllProducts } from '@/lib/data/wordpress-style-data-layer'",
  NEVER_USE: "Direct imports from individual vendor JSON files",
  PREFER: "Use service functions for data operations"
};
