import { NextResponse } from 'next/server';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

export async function GET() {
  const tevaDeli = completeProductCatalog['teva-deli'];
  
  if (!tevaDeli) {
    return NextResponse.json({ 
      error: 'Teva Deli not found',
      availableVendors: Object.keys(completeProductCatalog)
    }, { status: 404 });
  }
  
  return NextResponse.json({
    vendor: tevaDeli.vendorName,
    vendorId: tevaDeli.vendorId,
    totalProducts: tevaDeli.products.length,
    categories: [...new Set(tevaDeli.products.map(p => p.category))],
    products: tevaDeli.products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      nameHe: p.nameHe,
      price: p.price,
      category: p.category,
      hasImage: !!p.image
    }))
  });
}
