import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

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
    
    // Load and convert main KFAR logo to base64
    let logoBase64 = '';
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'kfar_logo_primary_horizontal.png');
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (err) {
      console.error('Failed to load logo:', err);
      // Use a placeholder or skip logo if not found
    }
    
    // HTML template designed specifically for html2pdf.js
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    /* html2pdf.js optimized styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
    }
    
    .invoice-container {
      width: 190mm; /* Reduced from 210mm to prevent cutoff */
      margin: 0 auto;
      padding: 15px 20px; /* Adjusted padding */
    }
    
    /* Header Section */
    .header {
      display: table;
      width: 100%;
      margin-bottom: 25px;
      border-bottom: 2px solid #4caf50;
      padding-bottom: 15px;
    }
    
    .header-left {
      display: table-cell;
      width: 60%;
      vertical-align: top;
    }
    
    .header-right {
      display: table-cell;
      width: 40%;
      text-align: right;
      vertical-align: top;
      padding-right: 5px; /* Add padding to prevent cutoff */
    }
    
    .logo-section {
      display: table;
      margin-bottom: 10px;
    }
    
    .logo-img {
      display: table-cell;
      vertical-align: middle;
      padding-right: 15px;
    }
    
    .logo-img img {
      width: 120px;
      height: auto;
    }
    
    .logo-text {
      display: table-cell;
      vertical-align: middle;
    }
    
    .company-name {
      font-size: 26px;
      font-weight: bold;
      color: #4caf50;
      margin-bottom: 3px;
    }
    
    .company-subtitle {
      font-size: 13px;
      color: #666;
      margin-bottom: 2px;
    }
    
    .invoice-title {
      font-size: 22px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    
    .invoice-number {
      font-size: 13px;
      color: #666;
      margin-bottom: 2px;
    }
    
    /* Info Section */
    .info-section {
      display: table;
      width: 100%;
      margin-bottom: 30px;
    }
    
    .info-block {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 20px;
    }
    
    .info-block:last-child {
      padding-right: 0;
      padding-left: 20px;
    }
    
    .info-title {
      font-size: 12px;
      font-weight: bold;
      color: #4caf50;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    
    .info-text {
      font-size: 12px;
      color: #333;
      margin-bottom: 3px;
    }
    
    /* Table Section */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background-color: #4caf50;
      color: white;
    }
    
    .items-table th {
      padding: 10px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .items-table th:nth-child(2),
    .items-table th:nth-child(3),
    .items-table th:nth-child(4) {
      text-align: right;
    }
    
    .items-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 11px;
    }
    
    .items-table td:nth-child(2),
    .items-table td:nth-child(3),
    .items-table td:nth-child(4) {
      text-align: right;
    }
    
    .item-name {
      font-weight: 500;
      color: #333;
    }
    
    .item-vendor {
      font-size: 10px;
      color: #888;
      margin-top: 2px;
    }
    
    /* Summary Section */
    .summary-section {
      display: table;
      width: 100%;
      margin-top: 30px;
    }
    
    .summary-left {
      display: table-cell;
      width: 50%;
      vertical-align: top;
    }
    
    .summary-right {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 10px; /* Add padding to prevent cutoff */
    }
    
    .qr-container {
      text-align: center;
      padding: 15px;
    }
    
    .qr-code {
      border: 2px solid #e0e0e0;
      padding: 10px;
      display: inline-block;
      background: white;
    }
    
    .qr-text {
      font-size: 10px;
      color: #666;
      margin-top: 10px;
    }
    
    .totals-table {
      width: 100%;
      max-width: 280px;
      margin-left: auto;
    }
    
    .total-row {
      display: table;
      width: 100%;
      padding: 5px 0;
    }
    
    .total-label {
      display: table-cell;
      width: 60%;
      font-size: 12px;
      color: #666;
    }
    
    .total-value {
      display: table-cell;
      width: 40%;
      text-align: right;
      font-size: 12px;
      font-weight: 500;
      color: #333;
    }
    
    .total-row.subtotal {
      border-top: 1px solid #e0e0e0;
      padding-top: 10px;
    }
    
    .total-row.grand-total {
      background-color: #f97316;
      color: white;
      padding: 12px;
      margin-top: 10px;
    }
    
    .total-row.grand-total .total-label,
    .total-row.grand-total .total-value {
      color: white;
      font-size: 14px;
      font-weight: bold;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
    }
    
    .footer-thank {
      font-size: 16px;
      font-weight: bold;
      color: #4caf50;
      margin-bottom: 10px;
    }
    
    .footer-text {
      font-size: 11px;
      color: #666;
      margin-bottom: 5px;
    }
    
    /* Avoid page breaks */
    .items-table { page-break-inside: avoid; }
    .summary-section { page-break-inside: avoid; }
    .footer { page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        ${logoBase64 ? `
        <div style="margin-bottom: 10px;">
          <img src="${logoBase64}" alt="KFAR Logo" style="width: 150px; height: auto;" />
        </div>
        ` : `
        <div class="company-name">KFAR Marketplace</div>
        `}
        <div class="company-subtitle">Village of Peace, Dimona, Israel</div>
        <div class="company-subtitle">support@kfar.market | 052-KFAR-MKT</div>
      </div>
      <div class="header-right">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">#${invoiceNumber}</div>
        <div class="invoice-number">${formattedDate}</div>
      </div>
    </div>
    
    <!-- Customer & Payment Info -->
    <div class="info-section">
      <div class="info-block">
        <div class="info-title">Bill To</div>
        <div class="info-text"><strong>${data.customer.name}</strong></div>
        <div class="info-text">${data.customer.email}</div>
        <div class="info-text">${data.customer.phone}</div>
        ${data.customer.address ? `<div class="info-text">${data.customer.address}</div>` : ''}
      </div>
      <div class="info-block">
        <div class="info-title">Payment Details</div>
        <div class="info-text"><strong>Order ID:</strong> ${data.orderId}</div>
        <div class="info-text"><strong>Payment:</strong> ${data.paymentMethod}</div>
        <div class="info-text"><strong>Delivery:</strong> ${data.deliveryMethod || 'Standard'}</div>
        <div class="info-text"><strong>Status:</strong> Pending</div>
      </div>
    </div>
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%;">Item Description</th>
          <th style="width: 15%;">Qty</th>
          <th style="width: 17%;">Price</th>
          <th style="width: 18%;">Total</th>
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
    
    <!-- Summary Section -->
    <div class="summary-section">
      <div class="summary-left">
        <div class="qr-container">
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code" width="120" height="120" />
          </div>
          <div class="qr-text">Scan to pay online</div>
        </div>
      </div>
      <div class="summary-right">
        <div class="totals-table">
          <div class="total-row subtotal">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">₪${subtotal.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">VAT (17%):</div>
            <div class="total-value">₪${vatAmount.toFixed(2)}</div>
          </div>
          ${deliveryFee > 0 ? `
          <div class="total-row">
            <div class="total-label">Delivery:</div>
            <div class="total-value">₪${deliveryFee.toFixed(2)}</div>
          </div>
          ` : ''}
          <div class="total-row grand-total">
            <div class="total-label">Total Due:</div>
            <div class="total-value">₪${total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-thank">Thank you for shopping with KFAR! 🌱</div>
      <div class="footer-text">Supporting local vendors in the Village of Peace</div>
      <div class="footer-text" style="margin-top: 10px; font-size: 10px; color: #999;">
        This invoice was generated automatically and serves as proof of payment.
      </div>
    </div>
  </div>
  
  <!-- html2pdf.js library and configuration -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    // Configuration for html2pdf.js
    window.html2pdfConfig = {
      margin: 10,
      filename: 'invoice-${invoiceNumber}.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
        useCORS: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // Function to generate PDF
    window.generatePDF = function() {
      const element = document.querySelector('.invoice-container');
      const opt = window.html2pdfConfig;
      
      return html2pdf().set(opt).from(element).save();
    };
    
    // Function to get PDF as base64
    window.getPDFBase64 = function() {
      const element = document.querySelector('.invoice-container');
      const opt = window.html2pdfConfig;
      
      return html2pdf().set(opt).from(element).outputPdf('datauristring');
    };
  </script>
</body>
</html>
    `;
    
    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        html,
        config: {
          margin: 10,
          filename: `invoice-${invoiceNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            letterRendering: true,
            useCORS: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
          }
        },
        total,
        createdAt: new Date().toISOString()
      },
      message: 'HTML template ready for html2pdf.js conversion. Use the included script functions to generate PDF.'
    });
    
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}