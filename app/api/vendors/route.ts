import { NextRequest, NextResponse } from 'next/server';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import { query } from '@/lib/db/supabase-database';

export async function GET(request: NextRequest) {
  try {
    // Get all static vendors
    const staticVendors = Object.entries(vendorStores).map(([id, store]) => ({
      id,
      ...store,
      source: 'static'
    }));
    
    // Get all dynamic vendors from database
    let dynamicVendors = [];
    try {
      const result = await query(
        `SELECT 
          id, name, name_he, slug, email, phone, 
          logo, banner, description, description_he,
          address, delivery_options, business_hours,
          about_owner, status, featured, metadata,
          created_at, updated_at
        FROM vendors 
        WHERE status = 'active'
        ORDER BY created_at DESC`
      );
      
      dynamicVendors = result.rows.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        nameHe: vendor.name_he,
        slug: vendor.slug,
        description: vendor.description,
        logo: vendor.logo || '/images/placeholder-logo.jpg',
        banner: vendor.banner || '/images/default-store-banner.svg',
        categories: vendor.metadata?.categories || [vendor.metadata?.specialty] || ['general'],
        featured: vendor.featured,
        metadata: {
          ...vendor.metadata,
          established: vendor.metadata?.established || new Date(vendor.created_at).getFullYear().toString(),
          location: vendor.address || 'Dimona, Israel',
          businessHours: vendor.business_hours,
          isNew: (Date.now() - new Date(vendor.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 // 30 days
        },
        source: 'dynamic'
      }));
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Continue with static vendors only if database fails
    }
    
    // Combine vendors, avoiding duplicates (dynamic takes precedence)
    const dynamicIds = new Set(dynamicVendors.map(v => v.id));
    const combinedVendors = [
      ...dynamicVendors,
      ...staticVendors.filter(v => !dynamicIds.has(v.id))
    ];
    
    return NextResponse.json({
      success: true,
      vendors: combinedVendors,
      total: combinedVendors.length
    });
    
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}