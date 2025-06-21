import { NextRequest, NextResponse } from 'next/server';
import { completeProductCatalog } from '@/lib/data/complete-catalog';
import { query } from '@/lib/db/supabase-database';

// This is the route the vendor store page is actually calling
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  
  // First, check static catalog
  const vendorData = completeProductCatalog[vendorId as keyof typeof completeProductCatalog];
  
  if (vendorData) {
    // Return static vendor data in the expected format
    const storeData = {
      vendor: {
        id: vendorId,
        name: vendorData.vendorName,
        description: getVendorDescription(vendorId),
        logo: getVendorLogo(vendorId),
        banner: `/images/banners/${getBannerNumber(vendorId)}.jpg`,
        products: vendorData.products,
        categories: [getVendorCategory(vendorId)],
        metadata: {
          established: '2020',
          location: 'Village of Peace, Dimona',
          specialty: getVendorCategory(vendorId)
        }
      }
    };
    return NextResponse.json(storeData);
  }
  
  // If not in static catalog, check database for dynamic vendors
  try {
    const vendorResult = await query(
      `SELECT 
        id, name, name_he, slug, email, phone, 
        logo, banner, description, description_he,
        address, delivery_options, business_hours,
        about_owner, status, featured, metadata,
        created_at, updated_at
      FROM vendors 
      WHERE id = $1 OR slug = $1`,
      [vendorId]
    );
    
    if (vendorResult.rows.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    
    const vendor = vendorResult.rows[0];
    
    // Get vendor products
    const productsResult = await query(
      `SELECT 
        id, name, name_he, description, price,
        category, image, is_vegan, is_kosher, in_stock
      FROM products 
      WHERE vendor_id = $1 
      ORDER BY created_at DESC`,
      [vendor.id]
    );
    
    // Transform to match the expected format
    const storeData = {
      vendor: {
        id: vendor.id,
        name: vendor.name,
        nameHe: vendor.name_he,
        description: vendor.description,
        descriptionHe: vendor.description_he,
        logo: vendor.logo || '/images/placeholder-logo.jpg',
        banner: vendor.banner || '/images/default-store-banner.svg',
        products: productsResult.rows.map((p: any) => ({
          id: p.id,
          name: p.name,
          nameHe: p.name_he || p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          category: p.category,
          inStock: p.in_stock,
          isVegan: p.is_vegan,
          isKosher: p.is_kosher
        })),
        categories: vendor.metadata?.categories || [vendor.metadata?.specialty] || ['general'],
        metadata: {
          ...vendor.metadata,
          established: vendor.metadata?.established || new Date(vendor.created_at).getFullYear().toString(),
          location: vendor.address || 'Dimona, Israel',
          deliveryOptions: vendor.delivery_options,
          businessHours: vendor.business_hours,
          aboutOwner: vendor.about_owner
        }
      }
    };
    
    return NextResponse.json(storeData);
    
  } catch (error) {
    console.error('Error fetching vendor from database:', error);
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }
}

function getHebrewName(vendorId: string): string {
  const names: { [key: string]: string } = {
    'teva-deli': 'טבע דלי',
    'queens-cuisine': 'מטבח המלכה',
    'gahn-delight': 'גן עונג',
    'atur-avior': 'גן האור',
    'people-store': 'חנות העם',
    'vop-shop': 'חנות כפר השלום'
  };
  return names[vendorId] || '';
}

function getVendorCategory(vendorId: string): string {
  const categories: { [key: string]: string } = {
    'teva-deli': 'food',
    'queens-cuisine': 'food',
    'gahn-delight': 'desserts',
    'atur-avior': 'wellness',
    'people-store': 'grocery',
    'vop-shop': 'merchandise'
  };
  return categories[vendorId] || 'food';
}

function getVendorDescription(vendorId: string): string {
  const descriptions: { [key: string]: string } = {
    'teva-deli': 'Premium Israeli vegan deli since 1983, creating innovative plant-based alternatives',
    'queens-cuisine': 'Artisan plant-based meat alternatives with authentic Middle Eastern flavors',
    'gahn-delight': 'Handcrafted vegan ice cream & desserts made with love and natural ingredients',
    'atur-avior': 'Organic superfood blends & wellness products for a healthy lifestyle',
    'people-store': 'Community marketplace for daily essentials and specialty ingredients',
    'vop-shop': 'Village of Peace heritage & wellness products celebrating 50 years'
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

function getBannerNumber(vendorId: string): number {
  const banners: { [key: string]: number } = {
    'teva-deli': 1,
    'queens-cuisine': 2,
    'gahn-delight': 3,
    'atur-avior': 4,
    'people-store': 5,
    'vop-shop': 6
  };
  return banners[vendorId] || 1;
}