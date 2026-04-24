import { NextRequest, NextResponse } from 'next/server';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  
  // Get vendor data and products from catalog
  const vendorData = completeProductCatalog[vendorId as keyof typeof completeProductCatalog];
  
  if (!vendorData) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }
  
  // Map vendor data to expected format
  const vendor = {
    id: vendorId,
    name: vendorData.vendorName,
    description: getVendorDescription(vendorId),
    logo: getVendorLogo(vendorId),
    rating: getVendorRating(vendorId),
    products: vendorData.products
  };
  
  return NextResponse.json(vendor);
}

function getVendorDescription(vendorId: string): string {
  const descriptions: { [key: string]: string } = {
    'teva-deli': 'Premium Israeli vegan deli since 1983',
    'queens-cuisine': 'Artisan plant-based meat alternatives',
    'gahn-delight': 'Handcrafted vegan ice cream & desserts',
    'atur-avior': 'Organic superfood blends & wellness',
    'people-store': 'Community marketplace for daily essentials',
    'vop-shop': 'Village of Peace heritage & wellness products'
  };
  return descriptions[vendorId] || '';
}

function getVendorLogo(vendorId: string): string {
  const logos: { [key: string]: string } = {
    'teva-deli': '/images/vendors/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
    'queens-cuisine': '/images/vendors/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
    'gahn-delight': '/images/vendors/gahn_delight_official_logo_master_brand_ice_cream.jpg',
    'atur-avior': '/images/vendors/Garden of Light Logo.jpg',
    'people-store': '/images/vendors/people_store_logo_community_retail.jpg',
    'vop-shop': '/images/vendors/vop_shop_official_logo_master_brand_village_of_peace.jpg'
  };
  return logos[vendorId] || '';
}

function getVendorRating(vendorId: string): number {
  const ratings: { [key: string]: number } = {
    'teva-deli': 4.8,
    'queens-cuisine': 4.9,
    'gahn-delight': 4.7,
    'atur-avior': 4.9,
    'people-store': 4.6,
    'vop-shop': 4.8
  };
  return ratings[vendorId] || 4.5;
}