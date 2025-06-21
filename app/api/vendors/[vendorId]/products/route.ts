import { NextRequest, NextResponse } from 'next/server';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  
  // Get vendor products from catalog
  const vendorData = completeProductCatalog[vendorId as keyof typeof completeProductCatalog];
  
  if (!vendorData) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    products: vendorData.products,
    pagination: {
      total: vendorData.products.length,
      page: 1,
      limit: 50
    }
  });
}