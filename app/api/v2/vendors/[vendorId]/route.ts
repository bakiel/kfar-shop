import { NextRequest, NextResponse } from 'next/server';
import { vendorDb, logAudit } from '@/lib/db/supabase-database';
import realtimeService from '@/lib/services/realtime-service';

interface RouteParams {
  params: {
    vendorId: string;
  };
}

// GET /api/v2/vendors/:vendorId - Get specific vendor
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const vendor = await vendorDb.getById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PUT /api/v2/vendors/:vendorId - Update vendor
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { vendorId } = params;

    // Get current vendor for comparison
    const currentVendor = await vendorDb.getById(vendorId);
    if (!currentVendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Update vendor
    const updatedVendor = await vendorDb.update(vendorId, body);

    // Log audit trail
    await logAudit(
      vendorId,
      'system', // TODO: Get from auth context
      'vendor_updated',
      'vendor',
      vendorId,
      body,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      request.headers.get('user-agent')
    );

    // Emit real-time update
    realtimeService.notifyVendorUpdate(vendorId, {
      action: 'updated',
      changes: body,
      vendor: updatedVendor
    });

    return NextResponse.json({
      success: true,
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

// DELETE /api/v2/vendors/:vendorId - Delete vendor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = params;
    
    const deleted = await vendorDb.delete(vendorId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Log audit trail
    await logAudit(
      vendorId,
      'system',
      'vendor_deleted',
      'vendor',
      vendorId,
      null,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      request.headers.get('user-agent')
    );

    // Emit real-time event
    realtimeService.notifyVendorUpdate(vendorId, {
      action: 'deleted',
      vendorId
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}