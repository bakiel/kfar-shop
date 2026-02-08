import { NextRequest, NextResponse } from 'next/server';

// DELETE - Delete a banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { vendorId: string; bannerId: string } }
) {
  try {
    const { vendorId, bannerId } = params;
    
    // In production, this would delete from the database
    console.log(`Banner deleted - Vendor: ${vendorId}, Banner: ${bannerId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      deletedId: bannerId
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}