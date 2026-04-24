import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { vendorId: string; bannerId: string } }
) {
  try {
    const { vendorId, bannerId } = params;
    const { isActive } = await request.json();
    
    // In production, this would update the banner status in the database
    console.log(`Banner status updated - Vendor: ${vendorId}, Banner: ${bannerId}, Active: ${isActive}`);
    
    // Simulate status update
    const updatedBanner = {
      id: bannerId,
      vendorId,
      isActive,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: `Banner ${isActive ? 'activated' : 'deactivated'} successfully`,
      banner: updatedBanner
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    return NextResponse.json(
      { error: 'Failed to update banner status' },
      { status: 500 }
    );
  }
}