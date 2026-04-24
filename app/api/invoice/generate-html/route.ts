import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Calculate totals
    const subtotal = data.subtotal || data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const vatAmount = data.vat || (subtotal * 0.17) || 0;
    const deliveryFee = data.deliveryFee || 0;
    const total = data.total || (subtotal + vatAmount + deliveryFee);
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(
      `https://kfar-shop.vercel.app/pay/${invoiceNumber}`,
      { width: 150 }
    );
    
    // Generate HTML invoice
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    
    @media print {
      body {
        background: white;
      }
      .invoice-container {
        box-shadow: none;
        max-width: 100%;
      }
      .no-print {
        display: none;
      }
    }
    
    .header {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      padding: 30px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .company-info h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .company-info p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .invoice-title {
      text-align: right;
    }
    
    .invoice-title h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .invoice-title p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .invoice-details {
      padding: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .detail-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 15px;
      letter-spacing: 0.5px;
    }
    
    .detail-section p {
      margin-bottom: 5px;
      color: #1f2937;
      font-size: 14px;
    }
    
    .items-section {
      padding: 40px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .items-table thead th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(4) {
      text-align: right;
    }
    
    .items-table tbody td {
      padding: 16px 12px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }
    
    .items-table tbody tr:hover {
      background: #f9fafb;
    }
    
    .items-table tbody td:nth-child(2),
    .items-table tbody td:nth-child(3),
    .items-table tbody td:nth-child(4) {
      text-align: right;
    }
    
    .item-name {
      font-weight: 500;
      color: #1f2937;
    }
    
    .item-vendor {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
    
    .summary-section {
      padding: 40px;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .qr-section {
      text-align: center;
    }
    
    .qr-section img {
      border: 2px solid #e5e7eb;
      padding: 10px;
      background: white;
      border-radius: 8px;
    }
    
    .qr-section p {
      margin-top: 10px;
      font-size: 12px;
      color: #6b7280;
    }
    
    .totals-section {
      min-width: 300px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .total-row.subtotal {
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
    }
    
    .total-row.grand-total {
      background: #f97316;
      color: white;
      padding: 15px 20px;
      margin-top: 15px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    
    .footer {
      padding: 30px 40px;
      background: white;
      text-align: center;
      border-top: 2px solid #e5e7eb;
    }
    
    .footer h4 {
      color: #4caf50;
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .footer p {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 5px;
    }
    
    .print-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #4caf50;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .print-button:hover {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>KFAR Marketplace</h1>
        <p>Village of Peace, Dimona, Israel</p>
        <p>support@kfar.market | 052-KFAR-MKT</p>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <p>#${invoiceNumber}</p>
        <p>${formattedDate}</p>
      </div>
    </div>
    
    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="detail-section">
        <h3>Bill To</h3>
        <p><strong>${data.customer.name}</strong></p>
        <p>${data.customer.email}</p>
        <p>${data.customer.phone}</p>
        ${data.customer.address ? `<p>${data.customer.address}</p>` : ''}
      </div>
      <div class="detail-section">
        <h3>Payment Details</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        <p><strong>Delivery:</strong> ${data.deliveryMethod || 'Standard'}</p>
        <p><strong>Status:</strong> <span style="color: #10b981;">Pending</span></p>
      </div>
    </div>
    
    <!-- Items -->
    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item: any) => `
            <tr>
              <td>
                <div class="item-name">${item.name}</div>
                ${item.vendor ? `<div class="item-vendor">by ${item.vendor}</div>` : ''}
              </td>
              <td>${item.quantity}</td>
              <td>₪${item.price.toFixed(2)}</td>
              <td><strong>₪${(item.price * item.quantity).toFixed(2)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Summary -->
    <div class="summary-section">
      <div class="qr-section">
        <img src="${qrCodeDataUrl}" alt="QR Code" width="150" height="150">
        <p>Scan to pay online</p>
      </div>
      <div class="totals-section">
        <div class="total-row subtotal">
          <span>Subtotal:</span>
          <span><strong>₪${subtotal.toFixed(2)}</strong></span>
        </div>
        <div class="total-row">
          <span>VAT (17%):</span>
          <span>₪${vatAmount.toFixed(2)}</span>
        </div>
        ${deliveryFee > 0 ? `
        <div class="total-row">
          <span>Delivery:</span>
          <span>₪${deliveryFee.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>Total Due:</span>
          <span>₪${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <h4>Thank you for shopping with KFAR! 🌱</h4>
      <p>Supporting local vendors in the Village of Peace</p>
      <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
        This invoice was generated automatically and serves as proof of payment.
        For questions, please contact support@kfar.market
      </p>
    </div>
  </div>
  
  <!-- Print Button -->
  <button class="print-button no-print" onclick="window.print()">
    Print Invoice
  </button>
  
  <script>
    // Auto-print if requested
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoprint') === 'true') {
      window.print();
    }
  </script>
</body>
</html>
    `;
    
    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        html,
        total,
        createdAt: new Date().toISOString()
      },
      message: 'HTML invoice generated successfully. Use browser print to save as PDF.'
    });
    
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}