import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Mock statistics data
    // In production, calculate from order history
    const stats = {
      totalOrders: 42,
      totalSpent: 3580,
      savedWithDiscounts: 425,
      pointsRedeemed: 1200,
      favoriteVendor: 'Teva Deli',
      lastOrderDate: new Date('2024-12-20'),
      averageOrderValue: 85,
      shoppingFrequency: 8, // days between orders
      
      // Category breakdown
      categoryBreakdown: {
        'dairy-alternatives': 35,
        'prepared-foods': 28,
        'fresh-produce': 20,
        'pantry': 17
      },
      
      // Vendor breakdown
      vendorBreakdown: {
        'teva-deli': 45,
        'gahn-delight': 25,
        'vop-shop': 20,
        'queens-cuisine': 10
      },
      
      // Environmental impact
      environmentalImpact: {
        co2Saved: 127, // kg
        plasticFreeOrders: 42,
        localPurchases: 100 // percentage
      },
      
      // Time patterns
      timePatterns: {
        mostActiveDay: 'Sunday',
        mostActiveHour: 10,
        weekendVsWeekday: { weekend: 65, weekday: 35 }
      }
    };

    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}