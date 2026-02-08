import { NextResponse } from 'next/server';
import { db } from '@/lib/db/postgres-client';

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

    // TODO: Validate token and fetch from database
    // For now, return mock data
    const mockCustomer = {
      id: 'demo-customer-001',
      name: 'Sarah Cohen',
      email: 'sarah@example.com',
      avatar: '/images/customers/sarah-avatar.jpg',
      joinedDate: new Date('2024-01-15'),
      loyaltyTier: 'gold',
      points: 5250,
      lifetimePoints: 8500,
      preferences: {
        dietaryRestrictions: ['vegan', 'gluten-free'],
        favoriteCategories: ['dairy-alternatives', 'prepared-foods'],
        shoppingFrequency: 'weekly',
        preferredVendors: ['teva-deli', 'gahn-delight'],
        communicationPreferences: {
          emailOrders: true,
          smsDeliveries: true,
          newsletter: false
        }
      },
      address: {
        street: '12 Peace Street',
        city: 'Dimona',
        region: 'Negev',
        postalCode: '8600000'
      },
      phoneNumber: '+972-50-123-4567'
    };

    return NextResponse.json({
      success: true,
      customer: mockCustomer
    });

  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // TODO: Update in PostgreSQL database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      updates
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
