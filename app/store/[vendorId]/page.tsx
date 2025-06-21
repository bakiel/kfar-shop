import { notFound } from 'next/navigation';
import { completeProductCatalog } from '@/lib/data/complete-catalog';
import VendorStorePage from '@/components/vendor/VendorStorePage';
import Layout from '@/components/layout/Layout';
import { Product } from '@/lib/data/products';

interface PageProps {
  params: Promise<{
    vendorId: string;
  }>;
}

// Vendor theme mappings based on their brand identity
const vendorThemes = {
  'teva-deli': 'modern',
  'queens-cuisine': 'artisanal', 
  'gahn-delight': 'fresh',
  'atur-avior': 'premium',
  'people-store': 'community',
  'vop-shop': 'heritage'
} as const;

// Extended vendor data configurations
const vendorConfigs = {
  'teva-deli': {
    bannerImage: '/images/vendors/teva-deli/banner.jpg',
    estimatedDeliveryTime: '1-2 days',
    minimumOrder: 150,
    certifications: ['Badatz', 'Vegan Certified'],
    features: ['Plant-Based', 'Kosher Certified', 'Made in Israel', 'No Preservatives', 'High Protein'],
    operatingHours: [
      { day: 'Sunday', open: '08:00', close: '18:00' },
      { day: 'Monday', open: '08:00', close: '18:00' },
      { day: 'Tuesday', open: '08:00', close: '18:00' },
      { day: 'Wednesday', open: '08:00', close: '18:00' },
      { day: 'Thursday', open: '08:00', close: '18:00' },
      { day: 'Friday', open: '08:00', close: '14:00' },
      { day: 'Saturday', closed: true }
    ],
    contactInfo: {
      phone: '03-123-4567',
      email: 'info@tevadeli.co.il',
      address: 'Industrial Zone, Kiryat Malachi, Israel'
    }
  },
  'queens-cuisine': {
    bannerImage: '/images/vendors/queens-cuisine/banner.jpg',
    estimatedDeliveryTime: '2-3 days',
    minimumOrder: 200,
    certifications: ['Organic', 'Vegan Society'],
    features: ['Artisanal', 'Small Batch', 'Traditional Methods', 'Zero Waste', 'Local Ingredients'],
    operatingHours: [
      { day: 'Sunday', open: '09:00', close: '17:00' },
      { day: 'Monday', open: '09:00', close: '17:00' },
      { day: 'Tuesday', open: '09:00', close: '17:00' },
      { day: 'Wednesday', open: '09:00', close: '17:00' },
      { day: 'Thursday', open: '09:00', close: '17:00' },
      { day: 'Friday', open: '09:00', close: '13:00' },
      { day: 'Saturday', closed: true }
    ],
    contactInfo: {
      phone: '08-655-8900',
      email: 'orders@queenscuisine.co.il',
      address: 'Village of Peace, Dimona'
    }
  },
  'gahn-delight': {
    bannerImage: '/images/vendors/gahn-delight/banner.jpg',
    estimatedDeliveryTime: 'Same day',
    minimumOrder: 80,
    certifications: ['Kosher Dairy', 'Natural'],
    features: ['Handcrafted', 'Natural Ingredients', 'No Artificial Colors', 'Small Batch', 'Seasonal Flavors'],
    operatingHours: [
      { day: 'Sunday', open: '10:00', close: '22:00' },
      { day: 'Monday', open: '10:00', close: '22:00' },
      { day: 'Tuesday', open: '10:00', close: '22:00' },
      { day: 'Wednesday', open: '10:00', close: '22:00' },
      { day: 'Thursday', open: '10:00', close: '22:00' },
      { day: 'Friday', open: '10:00', close: '15:00' },
      { day: 'Saturday', open: '20:00', close: '23:00' }
    ],
    contactInfo: {
      phone: '08-655-3333',
      email: 'sweet@gahndelight.com',
      address: 'Main Street, Village of Peace'
    }
  },
  'atur-avior': {
    bannerImage: '/images/vendors/garden-of-light/banner.jpg',
    estimatedDeliveryTime: '1-2 days',
    minimumOrder: 250,
    certifications: ['USDA Organic', 'Demeter Biodynamic'],
    features: ['Premium Quality', 'Biodynamic', 'Raw Foods', 'Superfood Blends', 'Eco-Packaging'],
    operatingHours: [
      { day: 'Sunday', open: '08:00', close: '16:00' },
      { day: 'Monday', open: '08:00', close: '16:00' },
      { day: 'Tuesday', open: '08:00', close: '16:00' },
      { day: 'Wednesday', open: '08:00', close: '16:00' },
      { day: 'Thursday', open: '08:00', close: '16:00' },
      { day: 'Friday', open: '08:00', close: '13:00' },
      { day: 'Saturday', closed: true }
    ],
    contactInfo: {
      phone: '08-655-7777',
      email: 'wellness@gardenoflight.co.il',
      address: 'Wellness Center, Village of Peace'
    }
  },
  'people-store': {
    bannerImage: '/images/vendors/people-store/banner.jpg',
    estimatedDeliveryTime: 'Pickup available',
    minimumOrder: 50,
    certifications: ['Community Certified', 'Fair Trade'],
    features: ['Community Owned', 'Bulk Options', 'Local Suppliers', 'Zero Plastic', 'Member Discounts'],
    operatingHours: [
      { day: 'Sunday', open: '07:00', close: '20:00' },
      { day: 'Monday', open: '07:00', close: '20:00' },
      { day: 'Tuesday', open: '07:00', close: '20:00' },
      { day: 'Wednesday', open: '07:00', close: '20:00' },
      { day: 'Thursday', open: '07:00', close: '20:00' },
      { day: 'Friday', open: '07:00', close: '15:00' },
      { day: 'Saturday', closed: true }
    ],
    contactInfo: {
      phone: '08-655-1234',
      email: 'info@peoplestore.coop',
      address: 'Community Center, Village of Peace'
    }
  },
  'vop-shop': {
    bannerImage: '/images/vendors/vop-shop/banner.jpg',
    estimatedDeliveryTime: '3-5 days',
    minimumOrder: 100,
    certifications: ['Heritage Crafts', 'Authentic'],
    features: ['50+ Year Heritage', 'Handmade Items', 'Cultural Artifacts', 'Educational Resources', 'Community Support'],
    operatingHours: [
      { day: 'Sunday', open: '09:00', close: '17:00' },
      { day: 'Monday', open: '09:00', close: '17:00' },
      { day: 'Tuesday', open: '09:00', close: '17:00' },
      { day: 'Wednesday', open: '09:00', close: '17:00' },
      { day: 'Thursday', open: '09:00', close: '17:00' },
      { day: 'Friday', open: '09:00', close: '14:00' },
      { day: 'Saturday', closed: true }
    ],
    contactInfo: {
      phone: '08-655-5000',
      email: 'heritage@vopshop.org',
      address: 'Heritage Center, Village of Peace'
    }
  }
};

export default async function StorePage({ params }: PageProps) {
  const { vendorId } = await params;
  
  // First, try to get from static catalog
  let vendorStore = completeProductCatalog[vendorId];
  let vendorData: any = null;
  let products: Product[] = [];
  
  // If not in static catalog, check if it's a dynamic vendor (from onboarding)
  if (!vendorStore) {
    try {
      // Try to get from localStorage (for newly onboarded vendors)
      // Note: This is a temporary solution. In production, we'd fetch from database
      const storedData = typeof window !== 'undefined' 
        ? localStorage.getItem(`vendor_${vendorId}`)
        : null;
        
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        vendorStore = {
          id: vendorId,
          name: parsedData.storeName,
          description: parsedData.description,
          logo: parsedData.logo,
          banner: parsedData.banner,
          products: parsedData.products || [],
          categories: [parsedData.category],
          metadata: {
            established: new Date().getFullYear().toString(),
            location: parsedData.address || 'Dimona, Israel',
            specialty: parsedData.category
          }
        };
      } else {
        // For server-side rendering, we'll need to fetch from API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
          (process.env.NODE_ENV === 'production' ? 'https://kfar-marketplace.com' : 'http://localhost:3001');
        const response = await fetch(`${apiUrl}/api/vendor/${vendorId}`, {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          vendorStore = data.vendor;
        }
      }
    } catch (error) {
      console.error('Error fetching dynamic vendor:', error);
    }
  }
  
  // Debug logging
  console.log('StorePage Debug:', {
    vendorId,
    vendorStoreFound: !!vendorStore,
    vendorKeys: vendorStore ? Object.keys(vendorStore) : [],
    productCount: vendorStore?.products?.length || 0
  });
  
  if (!vendorStore) {
    notFound();
  }

  // Use the vendor store data directly - it's already properly structured
  const vendor = {
    id: vendorStore.id,
    name: vendorStore.name,
    nameHe: vendorStore.name, // Can be enhanced later
    products: vendorStore.products,
    description: vendorStore.description,
    logo: vendorStore.logo,
    banner: vendorStore.banner,
    categories: vendorStore.categories,
    metadata: vendorStore.metadata
  };

  // Transform vendor products to match Product interface
  const products: Product[] = vendor.products.map(p => ({
    id: p.id,
    name: p.name,
    nameHe: p.nameHe || p.name,
    description: p.description,
    descriptionHe: p.descriptionHe || p.description,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    category: p.category || 'general',
    vendor: vendor.name,
    vendorId: vendor.id,
    inStock: p.inStock !== false,
    isNew: p.isNew || false,
    isFeatured: p.isFeatured || false,
    tags: p.tags || [],
    kashrut: p.kashrut || 'badatz',
    organic: p.organic || false,
    vegan: true,
    glutenFree: p.glutenFree || false,
    sugarFree: p.sugarFree || false
  }));

  // Map vendor logos to correct paths
  const getVendorLogo = (vendorId: string) => {
    const logoMap: { [key: string]: string } = {
      'teva-deli': '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
      'queens-cuisine': '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
      'gahn-delight': '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
      'atur-avior': '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
      'garden-of-light': '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
      'people-store': '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',
      'vop-shop': '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg'
    };
    return logoMap[vendorId] || logoMap['garden-of-light'];
  };

    // Merge vendor data with extended configurations
  const vendorData = {
    ...vendor,
    businessName: vendor.name,
    businessNameHe: vendor.nameHe || vendor.name,
    productCount: vendor.products.length,
    logo: vendor.logo,
    banner: vendor.banner,
    description: vendor.description,
    categories: vendor.categories,
    metadata: vendor.metadata,
    rating: 4.8,
    reviewCount: 156,
    deliveryOptions: ['pickup', 'delivery'],
    paymentMethods: ['cash', 'card', 'bit'],
    deliveryFee: 20,
    socialMedia: {
      facebook: `https://facebook.com/${vendor.id}`,
      instagram: `https://instagram.com/${vendor.id}`
    },
    ...(vendorConfigs[vendor.id as keyof typeof vendorConfigs] || {})
  };

  const theme = vendorThemes[vendor.id as keyof typeof vendorThemes] || 'modern';

  // Temporarily disable template system to avoid cart context issues
  const useTemplateSystem = false;

  // Fallback to original component with Layout wrapper
  return (
    <Layout>
      <VendorStorePage 
        vendorId={vendor.id}
        vendorData={vendorData}
        products={products}
        theme={theme}
      />
    </Layout>
  );
}