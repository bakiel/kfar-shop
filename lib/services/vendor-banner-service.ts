// Vendor Banner Service
// Provides banner information and configurations for admin dashboard

export interface VendorBannerInfo {
  vendorId: string;
  bannerPath: string;
  bannerDescription: string;
  lastUpdated: string;
}

export const vendorBannerService = {
  // Get all vendor banner configurations
  getAllBanners: async (): Promise<VendorBannerInfo[]> => {
    try {
      const response = await fetch('/data/vendor-banner-config.json');
      const config = await response.json();
      
      return Object.entries(config.banners).map(([vendorId, info]: [string, any]) => ({
        vendorId,
        bannerPath: info.path,
        bannerDescription: info.description,
        lastUpdated: config.updated
      }));
    } catch (error) {
      console.error('Error fetching banner config:', error);
      // Fallback to default configurations
      return getDefaultBannerConfig();
    }
  },

  // Get banner for specific vendor
  getVendorBanner: async (vendorId: string): Promise<VendorBannerInfo | null> => {
    const banners = await vendorBannerService.getAllBanners();
    return banners.find(b => b.vendorId === vendorId) || null;
  },

  // Update vendor banner (for admin use)
  updateVendorBanner: async (vendorId: string, newBannerPath: string): Promise<boolean> => {
    // This would typically call an API endpoint
    // For now, just log the update
    console.log(`Updating banner for ${vendorId} to ${newBannerPath}`);
    return true;
  }
};

// Default banner configurations
function getDefaultBannerConfig(): VendorBannerInfo[] {
  return [
    {
      vendorId: 'teva-deli',
      bannerPath: '/images/vendors/teva-deli/banner.jpg',
      bannerDescription: 'Plant-based protein products banner',
      lastUpdated: new Date().toISOString()
    },
    {
      vendorId: 'queens-cuisine',
      bannerPath: '/images/vendors/queens-cuisine/banner.jpg',
      bannerDescription: 'Artisanal vegan meat alternatives banner',
      lastUpdated: new Date().toISOString()
    },
    {
      vendorId: 'garden-of-light',
      bannerPath: '/images/vendors/garden-of-light/banner.jpg',
      bannerDescription: 'Vegan deli products banner',
      lastUpdated: new Date().toISOString()
    },
    {
      vendorId: 'people-store',
      bannerPath: '/images/vendors/people-store/banner.jpg',
      bannerDescription: 'Community store and fresh produce banner',
      lastUpdated: new Date().toISOString()
    },
    {
      vendorId: 'vop-shop',
      bannerPath: '/images/vendors/vop-shop/banner.jpg',
      bannerDescription: 'Community merchandise and apparel banner',
      lastUpdated: new Date().toISOString()
    },
    {
      vendorId: 'gahn-delight',
      bannerPath: '/images/vendors/gahn-delight/banner.jpg',
      bannerDescription: 'Ice cream and frozen desserts banner',
      lastUpdated: new Date().toISOString()
    }
  ];
}

// Banner mapping based on AI vision analysis
export const BANNER_MAPPINGS = {
  'gahn-delight': { 
    originalFile: '1.jpg', 
    theme: 'Ice cream and artisanal frozen desserts with warm peach tones'
  },
  'garden-of-light': { 
    originalFile: '2.jpg', 
    theme: 'Natural vegan deli products with soft, light aesthetic'
  },
  'vop-shop': { 
    originalFile: '3.jpg', 
    theme: 'Community merchandise and heritage items'
  },
  'people-store': { 
    originalFile: '4.jpg', 
    theme: 'Fresh produce and community grocery store'
  },
  'teva-deli': { 
    originalFile: '5.jpg', 
    theme: 'Professional plant-based protein products'
  },
  'queens-cuisine': { 
    originalFile: '6.jpg', 
    theme: 'Artisanal vegan meat alternatives and prepared foods'
  }
};