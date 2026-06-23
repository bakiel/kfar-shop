// Data Flow Configuration
export const DATA_SOURCES = {
  // Single source of truth
  MASTER_CATALOG: 'PostgreSQL via /lib/services/live-product-feed.ts and /lib/services/live-vendor-feed.ts',
  
  // API endpoints
  PRODUCTS_API: '/api/products-db',
  VENDORS_API: '/api/vendors',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  VENDOR_ADMIN: '/admin/vendor/[vendorId]',
  
  // Frontend routes
  SHOP: '/shop',
  VENDOR_STORES: '/vendor/[vendorId]',
  PRODUCT_PAGES: '/product/[productId]'
};

// Ensure all components use live feed APIs/services
export const DATA_IMPORT_RULES = {
  ALWAYS_USE: "Use /api/products-db, /api/vendors, live-product-feed, or live-vendor-feed",
  NEVER_USE: "Runtime imports from static catalog/demo data files",
  PREFER: "Use live service functions for server code and live API endpoints for client code"
};
