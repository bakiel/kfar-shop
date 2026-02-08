import { NextResponse } from 'next/server';
import { getLandingPageData } from '@/lib/services/landing-data-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLandingPageData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Landing data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing data' },
      { status: 500 }
    );
  }
}
