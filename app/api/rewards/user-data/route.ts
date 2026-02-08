import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // For now, return sample data
    // In production, fetch from database
    return NextResponse.json({
      success: true,
      userData: {
        points: 250,
        level: 'Gold',
        purchases: 5,
        memberSince: '2024-01-01'
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}