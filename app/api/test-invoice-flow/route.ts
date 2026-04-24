import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Sample order data for testing
    const testOrderData = {
      orderId: 'TEST-ORDER-001',
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+972-50-123-4567',
        address: '123 Peace Street, Dimona'
      },
      items: [
        {
          name: 'Test Product 1',
          vendor: 'Test Vendor',
          quantity: 2,
          price: 29.99
        },
        {
          name: 'Test Product 2',
          vendor: 'Test Vendor',
          quantity: 1,
          price: 45.00
        }
      ],
      paymentMethod: 'Credit Card',
      deliveryMethod: 'Standard Delivery',
      deliveryFee: 15
    };

    // 1. Generate invoice
    console.log('🔄 Step 1: Generating invoice...');
    const invoiceResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/invoice/generate-html2pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrderData)
    });

    if (!invoiceResponse.ok) {
      throw new Error('Failed to generate invoice');
    }

    const invoiceResult = await invoiceResponse.json();
    console.log('✅ Step 1 complete: Invoice generated', invoiceResult.invoice.invoiceNumber);

    // 2. Save to database
    console.log('🔄 Step 2: Saving invoice to database...');
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/invoices/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice: invoiceResult.invoice,
        orderId: testOrderData.orderId
      })
    });

    let saveResult = null;
    if (saveResponse.ok) {
      saveResult = await saveResponse.json();
      console.log('✅ Step 2 complete: Invoice saved to database');
    } else {
      const saveError = await saveResponse.json();
      console.log('⚠️ Step 2 warning: Failed to save to database:', saveError);
    }

    return NextResponse.json({
      success: true,
      message: 'Test invoice flow completed',
      results: {
        step1_invoice_generation: invoiceResult,
        step2_database_save: saveResult,
        test_invoice_url: `/invoice/view/${invoiceResult.invoice.invoiceNumber}`,
        direct_test_url: `/invoice/html2pdf`
      }
    });

  } catch (error) {
    console.error('❌ Test flow error:', error);
    return NextResponse.json(
      { 
        error: 'Test flow failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try the direct test at /invoice/html2pdf instead'
      },
      { status: 500 }
    );
  }
}