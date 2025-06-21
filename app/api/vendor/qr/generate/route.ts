import { NextRequest, NextResponse } from 'next/server';
import { qrService } from '@/lib/services/qr-service';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vendorId, 
      type, 
      data, 
      design,
      includeAnalytics = true 
    } = body;
    
    if (!vendorId || !type) {
      return NextResponse.json(
        { error: 'Vendor ID and type are required' },
        { status: 400 }
      );
    }
    
    // Generate QR code data
    let qrData: any = { vendorId };
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfar-marketplace.com';
    
    switch (type) {
      case 'vendor':
        qrData = {
          vendorId,
          url: `${baseUrl}/store/${vendorId}`,
          type: 'vendor_profile'
        };
        break;
        
      case 'products':
        qrData = {
          vendorId,
          url: `${baseUrl}/store/${vendorId}#products`,
          type: 'product_catalog'
        };
        break;
        
      case 'contact':
        // Generate vCard format
        qrData = {
          vendorId,
          vcard: generateVCard(data),
          type: 'contact_info'
        };
        break;
        
      case 'special-offer':
        qrData = {
          vendorId,
          url: `${baseUrl}/store/${vendorId}?offer=${encodeURIComponent(data.offerText)}`,
          offer: data.offerText,
          validUntil: data.validUntil,
          type: 'special_offer'
        };
        break;
        
      case 'event':
        qrData = {
          vendorId,
          url: `${baseUrl}/store/${vendorId}/event`,
          event: data.event,
          type: 'event_promotion'
        };
        break;
        
      case 'marketing':
        // Generic marketing QR with UTM parameters
        qrData = {
          vendorId,
          url: `${baseUrl}/store/${vendorId}?utm_source=qr&utm_medium=${data.medium || 'print'}&utm_campaign=${data.campaign || 'general'}`,
          campaign: data.campaign,
          type: 'marketing_campaign'
        };
        break;
    }
    
    // Add analytics tracking if enabled
    if (includeAnalytics) {
      qrData.analytics = {
        createdAt: new Date().toISOString(),
        source: 'vendor_dashboard',
        campaign: data.campaign || 'default'
      };
    }
    
    // Generate QR code using the service
    const qrRecord = await qrService.generateQRCode(
      type === 'vendor' ? 'vendor' : 'discount', // Map to service types
      qrData,
      {
        expiresIn: data.expiresIn, // in minutes
        maxUsage: data.maxUsage,
        template: design?.template || 'default'
      }
    );
    
    // Generate actual QR code image with custom design
    const qrOptions = {
      errorCorrectionLevel: 'H' as const,
      type: 'svg' as const,
      width: 300,
      margin: 1,
      color: {
        dark: design?.fgColor || '#478c0b',
        light: design?.bgColor || '#ffffff'
      }
    };
    
    // Generate the QR content
    const qrContent = qrData.vcard || qrData.url || JSON.stringify(qrData);
    const qrSvg = await QRCode.toString(qrContent, qrOptions);
    const qrDataUrl = await QRCode.toDataURL(qrContent, { ...qrOptions, type: 'image/png' as const });
    
    // Store QR code metadata (in production, save to database)
    const qrMetadata = {
      id: qrRecord.id,
      vendorId,
      type,
      shortCode: qrRecord.shortCode,
      fullUrl: qrRecord.fullUrl,
      qrContent,
      design,
      createdAt: new Date().toISOString(),
      expiresAt: qrRecord.expiresAt,
      analytics: {
        scans: 0,
        uniqueScans: 0,
        lastScanned: null
      }
    };
    
    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrRecord.id,
        shortCode: qrRecord.shortCode,
        url: qrRecord.fullUrl,
        svg: qrSvg,
        dataUrl: qrDataUrl,
        metadata: qrMetadata
      }
    });
    
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// Helper function to generate vCard format
function generateVCard(data: any): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.storeName || ''}`,
    `ORG:${data.storeName || ''}`,
    `TEL:${data.phone || ''}`,
    `EMAIL:${data.email || ''}`,
    `ADR:;;${data.address || ''};;;;`,
    `URL:${data.website || ''}`,
    'END:VCARD'
  ].join('\n');
  
  return vcard;
}

// GET endpoint to retrieve QR codes for a vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const type = searchParams.get('type');
    
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }
    
    // In production, fetch from database
    // For now, return mock data
    const mockQRCodes = [
      {
        id: 'qr_vendor_1',
        type: 'vendor',
        shortCode: 'ABCD1234',
        url: `https://kfar-marketplace.com/qr/ABCD1234`,
        createdAt: new Date().toISOString(),
        analytics: {
          scans: 42,
          uniqueScans: 28,
          lastScanned: new Date(Date.now() - 3600000).toISOString()
        }
      },
      {
        id: 'qr_products_1',
        type: 'products',
        shortCode: 'EFGH5678',
        url: `https://kfar-marketplace.com/qr/EFGH5678`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        analytics: {
          scans: 15,
          uniqueScans: 12,
          lastScanned: new Date(Date.now() - 7200000).toISOString()
        }
      }
    ];
    
    const filteredCodes = type 
      ? mockQRCodes.filter(qr => qr.type === type)
      : mockQRCodes;
    
    return NextResponse.json({
      success: true,
      qrCodes: filteredCodes,
      total: filteredCodes.length
    });
    
  } catch (error) {
    console.error('QR fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}