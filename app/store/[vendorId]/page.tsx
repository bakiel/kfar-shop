import { notFound } from 'next/navigation';
import VendorStorePage from '@/components/vendor/VendorStorePage';
import Layout from '@/components/layout/Layout';
import type { Product } from '@/lib/data/products';
import { getVendorById } from '@/lib/services/live-vendor-feed';

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

  const vendorStore = await getVendorById(vendorId, true);

  if (!vendorStore) {
    notFound();
  }

  // Use the vendor store data directly - it's already properly structured
  const vendor = {
    id: vendorStore.id,
    name: vendorStore.name,
    nameHe: vendorStore.nameHe || vendorStore.name,
    products: vendorStore.products || [],
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
    originalPrice: p.originalPrice || undefined,
    image: p.image,
    category: p.category || 'general',
    vendor: vendor.name,
    vendorId: vendor.id,
    inStock: p.inStock !== false,
    isNew: false,
    isFeatured: p.isFeatured || false,
    tags: p.tags || [],
    kashrut: p.kashrut || 'badatz',
    organic: p.organic || false,
    vegan: true,
    glutenFree: p.glutenFree || false,
    sugarFree: p.sugarFree || false
  }));

  // Merge vendor data with extended configurations
  const mergedVendorData = {
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
        vendorData={mergedVendorData}
        products={products}
        theme={theme}
      />
    </Layout>
  );
}
