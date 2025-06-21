import { usePathname, useParams } from 'next/navigation';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

export interface HeaderConfig {
  variant: 'default' | 'vendor' | 'checkout' | 'minimal' | 'product' | 'admin';
  showSearch: boolean;
  showCart: boolean;
  showBackButton: boolean;
  backButtonText?: string;
  backButtonLink?: string;
  vendorInfo?: any;
  transparent?: boolean;
  showCategories?: boolean;
  showLocationPicker?: boolean;
  customActions?: React.ReactNode;
}

export function useHeaderConfig(): HeaderConfig {
  const pathname = usePathname();
  const params = useParams();

  // Vendor store pages
  if (pathname.startsWith('/store/')) {
    const vendorId = params.vendorId as string;
    const vendor = completeProductCatalog.find(v => v.id === vendorId);
    
    return {
      variant: 'vendor',
      showSearch: true,
      showCart: true,
      showBackButton: true,
      backButtonText: 'Back to Marketplace',
      backButtonLink: '/marketplace',
      vendorInfo: vendor ? {
        id: vendor.id,
        name: vendor.name,
        logo: vendor.logo,
        rating: vendor.rating,
        productCount: vendor.products.length,
        category: vendor.category || 'General'
      } : undefined,
      showCategories: true
    };
  }

  // Product pages
  if (pathname.startsWith('/product/')) {
    const productId = params.id as string;
    
    // Find which vendor this product belongs to
    let vendorId = null;
    for (const vendor of completeProductCatalog) {
      if (vendor.products.find(p => p.id === productId)) {
        vendorId = vendor.id;
        break;
      }
    }
    
    return {
      variant: 'product',
      showSearch: true,
      showCart: true,
      showBackButton: true,
      backButtonText: vendorId ? 'Back to Store' : 'Continue Shopping',
      backButtonLink: vendorId ? `/store/${vendorId}` : '/shop'
    };
  }

  // Checkout flow
  if (pathname.startsWith('/checkout')) {
    return {
      variant: 'checkout',
      showSearch: false,
      showCart: true,
      showBackButton: true,
      backButtonText: 'Back to Cart',
      backButtonLink: '/cart'
    };
  }

  // Cart page
  if (pathname === '/cart') {
    return {
      variant: 'checkout',
      showSearch: false,
      showCart: false, // Don't show cart icon on cart page
      showBackButton: true,
      backButtonText: 'Continue Shopping',
      backButtonLink: '/shop'
    };
  }

  // Admin pages
  if (pathname.startsWith('/admin')) {
    return {
      variant: 'admin',
      showSearch: false,
      showCart: false,
      showBackButton: true,
      backButtonText: 'Exit Admin',
      backButtonLink: '/'
    };
  }

  // Vendor admin pages
  if (pathname.startsWith('/vendor/') && pathname.includes('/admin')) {
    return {
      variant: 'admin',
      showSearch: false,
      showCart: false,
      showBackButton: true,
      backButtonText: 'Back to Vendor Dashboard',
      backButtonLink: pathname.split('/admin')[0]
    };
  }

  // Marketplace page
  if (pathname === '/marketplace') {
    return {
      variant: 'default',
      showSearch: true,
      showCart: true,
      showBackButton: false,
      showCategories: true,
      showLocationPicker: true
    };
  }

  // Shop page
  if (pathname === '/shop') {
    return {
      variant: 'default',
      showSearch: true,
      showCart: true,
      showBackButton: false,
      showCategories: true
    };
  }

  // About pages
  if (pathname.startsWith('/about') || pathname === '/tourism') {
    return {
      variant: 'minimal',
      showSearch: false,
      showCart: true,
      showBackButton: true,
      backButtonText: 'Back to Home',
      backButtonLink: '/'
    };
  }

  // Homepage
  if (pathname === '/') {
    return {
      variant: 'default',
      showSearch: true,
      showCart: true,
      showBackButton: false,
      transparent: true, // Transparent header on homepage
      showLocationPicker: true
    };
  }

  // Default config
  return {
    variant: 'default',
    showSearch: true,
    showCart: true,
    showBackButton: false
  };
}