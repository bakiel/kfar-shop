import { NextResponse } from 'next/server';
import { onboardingService } from '@/lib/services/onboarding-service';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.phone || !data.name) {
      return NextResponse.json(
        { success: false, error: 'Phone and name are required' },
        { status: 400 }
      );
    }

    // Create customer using the onboarding service
    const result = await onboardingService.createCustomer({
      phone: data.phone,
      name: data.name,
      email: data.email,
      language: data.language || 'he',
      currency: data.currency || 'ILS',
      dietary: data.dietary || [],
      address: data.address
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Customer onboarding error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
