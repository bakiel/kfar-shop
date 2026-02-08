import { NextRequest, NextResponse } from 'next/server';

// Mock data store - In production, this would come from Supabase
const mockBanners = {
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
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
      },
      analytics: {
        views: 452,
        clicks: 87,
        conversions: 23
      }
    }
  ],
  'queens-cuisine': [
    {
      id: '2',
      template: 'announcement',
      isActive: true,
      content: {
        title: '📢 New Menu Items!',
        subtitle: 'Artisanal vegan steaks now available',
        description: 'Try our signature grilled seitan steaks with herbs and spices',
        ctaText: 'View Menu',
        ctaLink: '/store/queens-cuisine',
      },
      analytics: {
        views: 234,
        clicks: 45,
        conversions: 12
      }
    },
    {
      id: '3',
      template: 'event',
      isActive: true,
      content: {
        title: '🎉 Cooking Workshop',
        subtitle: 'Learn to make vegan steaks',
        description: 'Join our chef for a hands-on workshop this Thursday',
        ctaText: 'Reserve Spot',
        ctaLink: '/contact',
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        eventLocation: 'Community Center Kitchen'
      },
      analytics: {
        views: 156,
        clicks: 32,
        conversions: 8
      }
    }
  ],
  'gahn-delight': [
    {
      id: '4',
      template: 'seasonal',
      isActive: true,
      content: {
        title: '🌺 Summer Ice Cream Festival',
        subtitle: 'New flavors every day!',
        description: 'Beat the heat with our artisanal ice cream - try tahini chocolate today',
        ctaText: 'See Flavors',
        ctaLink: '/store/gahn-delight',
        image: '/images/gahn-delight/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg'
      },
      analytics: {
        views: 678,
        clicks: 123,
        conversions: 45
      }
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const vendorId = params.vendorId;
    
    // Get active banners for this vendor
    const vendorBanners = mockBanners[vendorId as keyof typeof mockBanners] || [];
    const activeBanners = vendorBanners.filter(banner => banner.isActive);

    return NextResponse.json({
      banners: activeBanners,
      total: activeBanners.length
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}