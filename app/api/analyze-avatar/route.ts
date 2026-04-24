import { NextRequest, NextResponse } from 'next/server';
import { CustomerAvatarAnalyzer } from '@/lib/services/customer-avatar-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { imagePath, imageId } = await request.json();

    if (!imagePath || !imageId) {
      return NextResponse.json(
        { error: 'Missing imagePath or imageId' },
        { status: 400 }
      );
    }

    const analyzer = new CustomerAvatarAnalyzer();
    const analysis = await analyzer.analyzeAvatar(imagePath, imageId);
    
    // Generate a complete customer profile
    const customerId = `cust_${Date.now().toString(36)}`;
    const profile = analyzer.generateCustomerProfile(analysis, customerId);

    return NextResponse.json({
      success: true,
      analysis,
      profile
    });
  } catch (error) {
    console.error('Avatar analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze avatar' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Analyze all avatars
    const analyzer = new CustomerAvatarAnalyzer();
    const analyses = await analyzer.analyzeAllAvatars();
    
    // Generate profiles for each
    const profiles = analyses.map((analysis, index) => {
      const customerId = `cust_${(index + 1).toString().padStart(3, '0')}`;
      return analyzer.generateCustomerProfile(analysis, customerId);
    });

    return NextResponse.json({
      success: true,
      totalAnalyzed: analyses.length,
      profiles
    });
  } catch (error) {
    console.error('Batch avatar analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze avatars' },
      { status: 500 }
    );
  }
}