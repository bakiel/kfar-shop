import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';

// Mock data store - In production, this would come from Supabase
const mockPromotions = [
  {
    id: '1',
    vendorId: 'teva-deli',
    vendorName: 'Teva Deli',
    productName: 'Vegan Shawarma Wrap',
    productImage: '/images/teva-deli/teva_deli_vegan_specialty_product_31_shawarma_kebab_middle_eastern_plant_based.jpg',
    originalPrice: 38,
    salePrice: 28,
    promotionType: 'flash_sale',
    title: '⚡ Lunch Flash Sale',
    description: 'Fresh shawarma wraps made to order',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    stock: 20,
    targetAudience: ['all'],
    budget: 50,
    status: 'pending_approval',
    submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: 5
  },
  {
    id: '2',
    vendorId: 'queens-cuisine',
    vendorName: "Queen's Cuisine",
    productName: 'Seitan Steak Platter',
    productImage: '/images/queens-cuisine/queens_cuisine_vegan_meat_grilled_seitan_steaks_plant_based_protein_alternative.jpg',
    originalPrice: 65,
    promotionType: 'new_arrival',
    title: '🆕 New Menu Item!',
    description: 'Try our signature grilled seitan steaks with special herbs',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: ['vegan', 'organic'],
    status: 'pending_approval',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 5
  },
  {
    id: '3',
    vendorId: 'gahn-delight',
    vendorName: 'Gahn Delight',
    productName: 'Tahini Chocolate Ice Cream',
    productImage: '/images/gahn-delight/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg',
    originalPrice: 18,
    salePrice: 15,
    promotionType: 'vendor_special',
    title: '🍦 Sweet Summer Special',
    description: 'Artisan ice cream with local tahini and premium cacao',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: ['families'],
    status: 'active',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 7
  }
];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Filter promotions by status
    const filteredPromotions = status === 'all' 
      ? mockPromotions 
      : mockPromotions.filter(p => p.status === status);

    return NextResponse.json({
      promotions: filteredPromotions,
      total: filteredPromotions.length
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}