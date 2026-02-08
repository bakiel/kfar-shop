import { NextRequest, NextResponse } from 'next/server';
import { getVendorAnalytics } from '@/lib/services/vendor-data-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId') || searchParams.get('vendor_id') || searchParams.get('id');
    
    // If no vendor ID provided, return summary for all vendors
    if (!vendorId) {
      // Mock data for all vendors summary
      const allVendorsAnalytics = {
        totalVendors: 6,
        totalProducts: 113,
        totalRevenue: 125000,
        totalOrders: 450,
        topVendors: [
          { id: 'teva-deli', name: 'Teva Deli', revenue: 45000, orders: 150 },
          { id: 'garden-of-light', name: 'Garden of Light', revenue: 35000, orders: 120 },
          { id: 'queens-cuisine', name: "Queen's Cuisine", revenue: 25000, orders: 85 }
        ],
        period: 'last_30_days'
      };
      
      return NextResponse.json({
        success: true,
        analytics: allVendorsAnalytics
      });
    }
    
    // Get analytics for specific vendor
    const analytics = await getVendorAnalytics(vendorId);
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'Vendor not found', vendorId },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      vendorId,
      analytics
    });
    
  } catch (error) {
    console.error('Vendor analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vendor analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for updating analytics (admin only)
export async function POST(request: NextRequest) {
  try {
    const { vendorId, metrics } = await request.json();
    
    if (!vendorId || !metrics) {
      return NextResponse.json(
        { error: 'Vendor ID and metrics are required' },
        { status: 400 }
      );
    }
    
    // Here you would typically update analytics in database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully',
      vendorId,
      metrics
    });
    
  } catch (error) {
    console.error('Update analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}