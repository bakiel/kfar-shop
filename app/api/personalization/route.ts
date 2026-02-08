import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import personalizationService from '@/lib/services/personalization-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type') || 'profile'; // profile, recommendations, predictions

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'profile':
        const profile = await personalizationService.analyzeCustomerBehavior(customerId);
        return NextResponse.json({ profile });

      case 'recommendations':
        const recommendations = await personalizationService.generatePersonalizedRecommendations(customerId);
        return NextResponse.json({ recommendations });

      case 'predictions':
        const predictions = await personalizationService.predictNextPurchase(customerId);
        return NextResponse.json({ predictions });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Personalization API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalization data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, scanData } = body;

    if (!customerId || !scanData) {
      return NextResponse.json(
        { error: 'Customer ID and scan data are required' },
        { status: 400 }
      );
    }

    // Analyze QR scan pattern
    const analysis = await personalizationService.analyzeQRScanPattern(customerId, scanData);

    // Update customer's last activity using PostgreSQL
    try {
      await query(
        `UPDATE customers SET last_activity = NOW(), updated_at = NOW() WHERE id = $1`,
        [customerId]
      );
    } catch (dbError) {
      console.log('Database update failed, continuing with analysis');
    }

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Personalization scan analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze scan data' },
      { status: 500 }
    );
  }
}
