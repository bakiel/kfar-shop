import { NextRequest, NextResponse } from 'next/server';

// Mock data store - In production, this would come from Supabase
const vendorBanners: Record<string, any[]> = {
  'teva-deli': [
    {
      id: '1',
      template: 'sale',
      isActive: true,
      content: {
        title: '🔥 Weekend Flash Sale!',
        subtitle: 'Save big on our bestsellers',
        description: 'Get 30% off on all schnitzels and shawarma wraps this weekend only!',
        ctaText: 'Shop Now',
        ctaLink: '/store/teva-deli',
        discount: 30,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      },
      analytics: {
        views: 452,
        clicks: 87,
        conversions: 23
      }
    },
    {
      id: '5',
      template: 'product_highlight',
      isActive: false,
      content: {
        title: '⭐ Featured Product',
        subtitle: 'Vegan Shawarma Wrap',
        description: 'Our bestseller - perfectly spiced and fresh',
        ctaText: 'Order Now',
        ctaLink: '/product/shawarma-wrap',
        image: '/images/teva-deli/teva_deli_vegan_specialty_product_31_shawarma_kebab_middle_eastern_plant_based.jpg'
      },
      analytics: {
        views: 234,
        clicks: 45,
        conversions: 12
      }
    }
  ]
};

// GET - Fetch all banners for a vendor
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.vendorId;
    const banners = vendorBanners[vendorId] || [];

    return NextResponse.json({
      banners,
      total: banners.length
    });
  } catch (error) {
    console.error('Error fetching vendor banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST - Create a new banner
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.vendorId;
    const body = await request.json();

    const newBanner = {
      id: Date.now().toString(),
      template: body.template,
      isActive: body.isActive || true,
      content: body.content,
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0
      },
      createdAt: new Date().toISOString()
    };

    // Initialize vendor banners array if it doesn't exist
    if (!vendorBanners[vendorId]) {
      vendorBanners[vendorId] = [];
    }

    vendorBanners[vendorId].push(newBanner);

    return NextResponse.json({
      success: true,
      banner: newBanner,
      message: 'Banner created successfully'
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing banner
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.vendorId;
    const { bannerId, ...updateData } = await request.json();

    if (!vendorBanners[vendorId]) {
      return NextResponse.json(
        { error: 'No banners found for this vendor' },
        { status: 404 }
      );
    }

    const bannerIndex = vendorBanners[vendorId].findIndex(b => b.id === bannerId);
    
    if (bannerIndex === -1) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Update the banner
    vendorBanners[vendorId][bannerIndex] = {
      ...vendorBanners[vendorId][bannerIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      banner: vendorBanners[vendorId][bannerIndex],
      message: 'Banner updated successfully'
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}