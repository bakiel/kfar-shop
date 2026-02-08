import { NextRequest, NextResponse } from 'next/server';

// Mock invoice generation for now - will integrate with existing service
async function generateInvoice(orderData: any) {
  // For now, return a simple JSON response
  // TODO: Integrate with /services/invoiceGenerator.js
  
  const invoiceNumber = `INV-${Date.now()}`;
  const qrData = `kfar://payment/${invoiceNumber}?amount=${orderData.total}&vendor=${orderData.vendorId}`;
  
  return {
    invoiceNumber,
    qrCode: qrData,
    orderDetails: orderData,
    generatedAt: new Date().toISOString()
  };
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.items || !orderData.customer) {
      return NextResponse.json(
        { error: 'Missing required order data' },
        { status: 400 }
      );
    }
    
    // Generate invoice data
    const invoice = await generateInvoice(orderData);
    
    // For now, return JSON
    // TODO: Generate actual PDF using pdfkit
    return NextResponse.json({
      success: true,
      invoice,
      downloadUrl: `/api/invoice/download/${invoice.invoiceNumber}`
    });
    
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('id');
  
  if (!invoiceId) {
    return NextResponse.json(
      { error: 'Invoice ID required' },
      { status: 400 }
    );
  }
  
  // Mock invoice retrieval
  return NextResponse.json({
    invoiceNumber: invoiceId,
    status: 'ready',
    downloadUrl: `/api/invoice/download/${invoiceId}`
  });
}