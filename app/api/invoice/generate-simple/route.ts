import { NextRequest, NextResponse } from 'next/server';
import { PDFInvoice } from '@h1dd3nsn1p3r/pdf-invoice';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Calculate totals
    const subtotal = data.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const vat = subtotal * 0.17;
    const deliveryFee = data.deliveryFee || 0;
    const total = subtotal + vat + deliveryFee;
    
    // Generate QR code as base64
    const qrData = {
      invoiceNumber,
      amount: total,
      paymentUrl: `https://kfar-final.vercel.app/pay/${invoiceNumber}`
    };
    
    const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 150,
      margin: 1
    });
    
    // Prepare invoice items
    const invoiceItems = data.items.map((item: any) => ({
      name: item.vendorName ? `${item.name} (${item.vendorName})` : item.name,
      quantity: item.quantity,
      price: item.price,
      tax: 17 // 17% VAT
    }));
    
    // Add delivery as an item if there's a fee
    if (deliveryFee > 0) {
      invoiceItems.push({
        name: 'Delivery Fee',
        quantity: 1,
        price: deliveryFee,
        tax: 0
      });
    }
    
    // Create invoice payload
    const payload = {
      company: {
        name: "KFAR Marketplace",
        address: "Village of Peace, Dimona, Israel",
        phone: "052-KFAR-MKT",
        email: "support@kfar.market",
        website: "https://kfar-final.vercel.app",
        taxId: "123456789" // Add real tax ID
      },
      customer: {
        name: data.customer.name,
        company: data.customer.company || '',
        address: data.customer.address || '',
        phone: data.customer.phone || '',
        email: data.customer.email || ''
      },
      invoice: {
        number: invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        status: 'Pending',
        currency: 'ILS',
        path: './invoice.pdf'
      },
      items: invoiceItems,
      qrCode: qrCodeBase64,
      note: `Payment Method: ${data.paymentMethod}\nDelivery Method: ${data.deliveryMethod}\n\nThank you for choosing KFAR Marketplace!\nThe Whole Village, In Your Hand`
    };
    
    // Generate PDF
    const invoice = new PDFInvoice(payload);
    const pdfBuffer = await invoice.create();
    
    // Convert to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        pdfBase64,
        qrCode: qrCodeBase64,
        total,
        createdAt: new Date().toISOString()
      },
      downloadUrl: `data:application/pdf;base64,${pdfBase64}`
    });
    
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}