import { NextRequest, NextResponse } from 'next/server';
import { vendorWelcomeService } from '@/lib/services/vendor-welcome-service';

export async function POST(request: NextRequest) {
  try {
    const { vendorId, vendorData } = await request.json();

    if (!vendorId || !vendorData) {
      return NextResponse.json(
        { error: 'Missing vendor ID or data' },
        { status: 400 }
      );
    }

    // Generate URLs
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market'}/vendor/dashboard?vendorId=${vendorId}`;
    const marketingMaterialsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market'}/vendor/marketing?vendorId=${vendorId}`;
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market'}/store/${vendorId}`;

    // Send welcome package
    const result = await vendorWelcomeService.sendWelcomePackage({
      vendor: vendorData,
      vendorId,
      qrCodeUrl,
      dashboardUrl,
      marketingMaterialsUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Welcome package sent successfully',
      ...result
    });

  } catch (error) {
    console.error('Error sending welcome package:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome package' },
      { status: 500 }
    );
  }
}