import { NextRequest, NextResponse } from 'next/server';
import { vendorDb } from '@/lib/db/supabase-database';
import realtimeService from '@/lib/services/realtime-service';

// GET /api/v2/vendors - Get all vendors with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
    };

    const vendors = await vendorDb.getAll(filters);
    
    return NextResponse.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST /api/v2/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create vendor in database
    const vendor = await vendorDb.create({
      ...body,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      status: 'pending',
      verified: false
    });

    // Emit real-time event
    realtimeService.notifyVendorUpdate(vendor.id, { action: 'created', vendor });

    return NextResponse.json({
      success: true,
      data: vendor
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}