import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/postgres-client';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';

export async function GET(request: NextRequest) {
  try {
    // First, try to get data from PostgreSQL database
    try {
      const vendors = await db.vendors.findAll();

      if (vendors && vendors.length > 0) {
        // Get products for active vendors
        const products = await db.products.findAll();

        // Map products to vendors
        const vendorsWithProducts = vendors.map((vendor: any) => {
          const vendorProducts = products.filter((p: any) => p.vendor_id === vendor.id);

          // If vendor has no products in database, try to get from local data
          if (vendorProducts.length === 0) {
            const localStore = vendorStores[vendor.slug];
            if (localStore && localStore.products.length > 0) {
              return {
                ...vendor,
                products: localStore.products.slice(0, 5).map(p => ({
                  id: p.id,
                  name: p.name,
                  name_he: p.nameHe,
                  price: p.price,
                  vendor_id: vendor.id,
                  category: p.category
                }))
              };
            }
          }

          return {
            ...vendor,
            products: vendorProducts
          };
        });

        return NextResponse.json({
          success: true,
          source: 'hybrid', // Using both database and local data
          vendors: vendorsWithProducts
        });
      }
    } catch (dbError) {
      console.error('Database error, falling back to local data:', dbError);
    }

    // Fallback to local data if database is not available or has no data
    const localVendors = Object.values(vendorStores).map(store => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      status: 'active',
      products: store.products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        name_he: p.nameHe,
        price: p.price,
        vendor_id: store.id,
        category: p.category
      }))
    }));

    return NextResponse.json({
      success: true,
      source: 'local',
      vendors: localVendors
    });

  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
