import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// KFAR Brand Colors
const COLORS = {
  leafGreen: '#478c0b',
  sunGold: '#f6af0d',
  earthFlame: '#c23c09',
  creamBase: '#fef9ef',
  soilBrown: '#3a3a1d',
  herbalMint: '#cfe7c1',
  white: '#ffffff',
  lightGray: '#e5e7eb'
};

interface InvoiceData {
  orderId: string;
  vendorName: string;
  vendorId: string;
  itemsByVendor?: any;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    name: string;
    nameHe?: string;
    quantity: number;
    price: number;
    vendorName?: string;
    vendorId?: string;
  }>;
  subtotal: number;
  vat: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt?: string;
  language?: 'en' | 'he';
}

export async function POST(request: NextRequest) {
  try {
    const invoiceData: InvoiceData = await request.json();
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const isHebrew = invoiceData.language === 'he';
    
    // Generate QR code for payment
    const qrData = {
      type: 'kfar_invoice',
      invoiceNumber,
      amount: invoiceData.total,
      vendorId: invoiceData.vendorId,
      orderId: invoiceData.orderId,
      paymentUrl: `https://kfar-final.vercel.app/pay/${invoiceNumber}`
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 150,
      margin: 1,
      color: {
        dark: COLORS.soilBrown,
        light: COLORS.white
      }
    });
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      autoFirstPage: true
    });
    
    // Collect PDF chunks
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Enhanced Header with vendor branding
    addEnhancedHeader(doc, invoiceData, invoiceNumber, isHebrew);
    
    // Professional QR Code Section
    addProfessionalQRSection(doc, qrCodeDataUrl, invoiceNumber, isHebrew);
    
    // Customer and Vendor Information
    addDetailedInfo(doc, invoiceData, isHebrew);
    
    // Items Table with vendor grouping
    addVendorGroupedItemsTable(doc, invoiceData, isHebrew);
    
    // Enhanced Totals Section
    addEnhancedTotalsSection(doc, invoiceData, isHebrew);
    
    // Professional Footer
    addProfessionalFooter(doc, isHebrew);
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    
    // Convert to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        pdfBase64,
        qrCode: qrCodeDataUrl,
        total: invoiceData.total,
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

function addEnhancedHeader(doc: PDFKit.PDFDocument, data: InvoiceData, invoiceNumber: string, isHebrew: boolean) {
  // Create gradient background
  const gradient = doc.linearGradient(0, 0, doc.page.width, 150);
  gradient.stop(0, COLORS.leafGreen)
          .stop(0.5, COLORS.sunGold)
          .stop(1, COLORS.herbalMint);
  
  doc.rect(0, 0, doc.page.width, 150).fill(gradient);
  
  // White overlay for text readability
  doc.rect(0, 0, doc.page.width, 150).fill(COLORS.white).opacity(0.92);
  
  // KFAR Marketplace branding
  doc.font('Helvetica-Bold');
  doc.fontSize(36)
     .fillColor(COLORS.leafGreen)
     .text('KFAR', 50, 35, { continued: true });
  
  doc.fontSize(16)
     .fillColor(COLORS.sunGold)
     .text(' MARKETPLACE', { continued: false });
  
  // Tagline
  doc.font('Helvetica');
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'הכפר כולו, ביד שלך' : 'The Whole Village, In Your Hand', 50, 75);
  
  // Multi-vendor indicator
  if (data.itemsByVendor && Object.keys(data.itemsByVendor).length > 1) {
    doc.rect(50, 95, 200, 25).fill(COLORS.herbalMint);
    doc.fontSize(11)
       .fillColor(COLORS.earthFlame)
       .text('🛍️ MULTI-VENDOR ORDER', 55, 102);
  }
  
  // Invoice badge
  doc.rect(380, 35, 165, 90).fill(COLORS.white);
  doc.rect(380, 35, 165, 90).stroke(COLORS.leafGreen).lineWidth(2);
  
  // Invoice icon
  doc.circle(462, 55, 18).fill(COLORS.sunGold);
  doc.fillColor(COLORS.white)
     .fontSize(20)
     .text('₪', 455, 45);
  
  doc.font('Helvetica-Bold');
  doc.fontSize(14)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'חשבונית מס' : 'TAX INVOICE', 390, 78, { width: 145, align: 'center' });
  
  doc.font('Helvetica');
  doc.fontSize(10)
     .fillColor(COLORS.earthFlame)
     .text(invoiceNumber, 390, 96, { width: 145, align: 'center' });
  
  const date = new Date(data.createdAt || new Date()).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
  doc.fontSize(9)
     .fillColor(COLORS.soilBrown)
     .text(date, 390, 110, { width: 145, align: 'center' });
}

function addProfessionalQRSection(doc: PDFKit.PDFDocument, qrCodeDataUrl: string, invoiceNumber: string, isHebrew: boolean) {
  doc.moveDown(2);
  
  // QR section with background
  doc.rect(420, 160, 125, 145).fill(COLORS.creamBase);
  doc.rect(420, 160, 125, 145).stroke(COLORS.lightGray);
  
  doc.font('Helvetica-Bold');
  doc.fontSize(11)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? '💳 סרוק לתשלום' : '💳 SCAN TO PAY', 425, 165, { width: 115, align: 'center' });
  
  // Extract and add QR code
  const base64Data = qrCodeDataUrl.split(',')[1];
  const qrBuffer = Buffer.from(base64Data, 'base64');
  doc.image(qrBuffer, 432, 185, { width: 100 });
  
  doc.font('Helvetica');
  doc.fontSize(8)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'סרוק עם האפליקציה' : 'Scan with banking app', 425, 290, { width: 115, align: 'center' });
}

function addDetailedInfo(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  // Customer section with icon
  doc.circle(35, 175, 10).fill(COLORS.leafGreen);
  doc.fillColor(COLORS.white)
     .fontSize(12)
     .text('C', 31, 169);
  
  doc.font('Helvetica-Bold');
  doc.fontSize(12)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'פרטי לקוח' : 'CUSTOMER DETAILS', 50, 160);
  
  doc.moveTo(50, 178)
     .lineTo(180, 178)
     .strokeColor(COLORS.leafGreen)
     .lineWidth(2)
     .stroke();
  
  doc.font('Helvetica');
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(data.customer.name, 50, 190)
     .text(data.customer.email, 50, 205)
     .text(data.customer.phone, 50, 220);
  
  if (data.customer.address) {
    doc.text(data.customer.address, 50, 235);
  }
  
  // Vendor section with icon
  doc.circle(235, 175, 10).fill(COLORS.sunGold);
  doc.fillColor(COLORS.white)
     .fontSize(12)
     .text('V', 231, 169);
  
  doc.font('Helvetica-Bold');
  doc.fontSize(12)
     .fillColor(COLORS.sunGold)
     .text(isHebrew ? 'פרטי ספק' : 'VENDOR DETAILS', 250, 160);
  
  doc.moveTo(250, 178)
     .lineTo(400, 178)
     .strokeColor(COLORS.sunGold)
     .lineWidth(2)
     .stroke();
  
  // Primary vendor
  doc.font('Helvetica-Bold');
  doc.fontSize(11)
     .fillColor(COLORS.soilBrown)
     .text(data.vendorName.toUpperCase(), 250, 190);
  
  // Multiple vendors list
  if (data.itemsByVendor && Object.keys(data.itemsByVendor).length > 1) {
    doc.font('Helvetica');
    doc.fontSize(9)
       .fillColor(COLORS.earthFlame);
    
    let yPos = 208;
    Object.keys(data.itemsByVendor).forEach((vendor, index) => {
      if (index > 0) {
        doc.text(`+ ${vendor}`, 250, yPos);
        yPos += 15;
      }
    });
  }
  
  doc.font('Helvetica');
  doc.fontSize(9)
     .fillColor(COLORS.soilBrown)
     .text(`${isHebrew ? 'משלוח:' : 'Delivery:'} ${data.deliveryMethod}`, 250, 240)
     .text(`${isHebrew ? 'תשלום:' : 'Payment:'} ${data.paymentMethod}`, 250, 255);
}

function addVendorGroupedItemsTable(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  let tableTop = 320;
  
  // Modern table header
  const gradient = doc.linearGradient(50, tableTop, 550, tableTop + 25);
  gradient.stop(0, COLORS.leafGreen)
          .stop(1, COLORS.sunGold);
  
  doc.rect(50, tableTop, 500, 25).fill(gradient);
  
  // Header text
  doc.font('Helvetica-Bold');
  doc.fontSize(10).fillColor(COLORS.white);
  
  const col1 = 55;
  const col2 = 280;
  const col3 = 360;
  const col4 = 440;
  
  doc.text(isHebrew ? 'מוצר' : 'Product', col1, tableTop + 7, { width: 220 });
  doc.text(isHebrew ? 'כמות' : 'Qty', col2, tableTop + 7);
  doc.text(isHebrew ? 'מחיר' : 'Price', col3, tableTop + 7);
  doc.text(isHebrew ? 'סה"כ' : 'Total', col4, tableTop + 7);
  
  let yPosition = tableTop + 30;
  
  // Group items by vendor if available
  if (data.itemsByVendor && Object.keys(data.itemsByVendor).length > 0) {
    Object.entries(data.itemsByVendor).forEach(([vendor, items]: [string, any]) => {
      // Vendor header
      doc.rect(50, yPosition - 5, 500, 20).fill(COLORS.herbalMint);
      doc.font('Helvetica-Bold');
      doc.fontSize(9)
         .fillColor(COLORS.soilBrown)
         .text(`📦 ${vendor}`, 55, yPosition);
      yPosition += 25;
      
      // Vendor items
      doc.font('Helvetica');
      items.forEach((item: any, index: number) => {
        if (index % 2 === 0) {
          doc.rect(50, yPosition - 5, 500, 25).fill(COLORS.creamBase);
        }
        
        doc.fillColor(COLORS.soilBrown);
        const itemName = isHebrew && item.nameHe ? item.nameHe : item.name;
        const price = `₪${item.price.toFixed(2)}`;
        const total = `₪${(item.price * item.quantity).toFixed(2)}`;
        
        doc.fontSize(9);
        doc.text(itemName, col1, yPosition, { width: 220 });
        doc.text(item.quantity.toString(), col2, yPosition);
        doc.text(price, col3, yPosition);
        doc.text(total, col4, yPosition);
        
        yPosition += 25;
      });
      
      yPosition += 10; // Space between vendors
    });
  } else {
    // Fallback to regular items list
    data.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 5, 500, 25).fill(COLORS.creamBase);
      }
      
      doc.fillColor(COLORS.soilBrown);
      const itemName = isHebrew && item.nameHe ? item.nameHe : item.name;
      const price = `₪${item.price.toFixed(2)}`;
      const total = `₪${(item.price * item.quantity).toFixed(2)}`;
      
      doc.fontSize(9);
      doc.text(itemName, col1, yPosition, { width: 220 });
      doc.text(item.quantity.toString(), col2, yPosition);
      doc.text(price, col3, yPosition);
      doc.text(total, col4, yPosition);
      
      yPosition += 25;
    });
  }
}

function addEnhancedTotalsSection(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  const yStart = 500;
  
  // Decorative line
  doc.moveTo(300, yStart)
     .lineTo(550, yStart)
     .strokeColor(COLORS.lightGray)
     .lineWidth(1)
     .stroke();
  
  let yPos = yStart + 20;
  doc.font('Helvetica');
  doc.fontSize(10).fillColor(COLORS.soilBrown);
  
  // Subtotal
  doc.text(isHebrew ? 'סכום ביניים:' : 'Subtotal:', 380, yPos);
  doc.text(`₪${data.subtotal.toFixed(2)}`, 480, yPos, { align: 'right' });
  
  // VAT
  yPos += 20;
  doc.text(isHebrew ? 'מע"מ (17%):' : 'VAT (17%):', 380, yPos);
  doc.text(`₪${(data.vat || 0).toFixed(2)}`, 480, yPos, { align: 'right' });
  
  // Delivery
  if (data.deliveryFee > 0) {
    yPos += 20;
    doc.text(isHebrew ? 'דמי משלוח:' : 'Delivery:', 380, yPos);
    doc.text(`₪${data.deliveryFee.toFixed(2)}`, 480, yPos, { align: 'right' });
  }
  
  // Total with emphasis
  yPos += 30;
  const totalGradient = doc.linearGradient(370, yPos - 5, 550, yPos + 25);
  totalGradient.stop(0, COLORS.earthFlame)
               .stop(1, COLORS.sunGold);
  
  doc.rect(370, yPos - 5, 180, 30).fill(totalGradient);
  
  doc.font('Helvetica-Bold');
  doc.fontSize(12)
     .fillColor(COLORS.white)
     .text(isHebrew ? 'סה"כ לתשלום:' : 'Total Due:', 380, yPos + 3);
  doc.text(`₪${data.total.toFixed(2)}`, 480, yPos + 3, { align: 'right' });
}

function addProfessionalFooter(doc: PDFKit.PDFDocument, isHebrew: boolean) {
  const footerY = doc.page.height - 140;
  
  // Footer gradient bar
  const gradient = doc.linearGradient(0, footerY, doc.page.width, footerY + 5);
  gradient.stop(0, COLORS.leafGreen)
          .stop(0.5, COLORS.sunGold)
          .stop(1, COLORS.earthFlame);
  
  doc.rect(0, footerY, doc.page.width, 5).fill(gradient);
  
  // Thank you message
  doc.font('Helvetica-Bold');
  doc.fontSize(14)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? '🌱 תודה שבחרתם ב-KFAR!' : '🌱 Thank you for choosing KFAR!', 
           0, footerY + 20, { align: 'center', width: doc.page.width });
  
  doc.font('Helvetica');
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'תומכים בעסקים מקומיים של כפר השלום' : 'Supporting Village of Peace Local Businesses',
           0, footerY + 40, { align: 'center', width: doc.page.width });
  
  // Contact info
  doc.fontSize(9)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'לשאלות: support@kfar.market | 052-KFAR-MKT' : 
                      'Questions? support@kfar.market | 052-KFAR-MKT',
           0, footerY + 60, { align: 'center', width: doc.page.width });
  
  // Legal text
  doc.fontSize(8)
     .fillColor(COLORS.lightGray)
     .text(isHebrew ? 'חשבונית זו הופקה אוטומטית ומהווה אסמכתא לתשלום' :
                      'This invoice was generated automatically and serves as proof of payment',
           0, doc.page.height - 40, { align: 'center', width: doc.page.width });
  
  // Community message
  doc.fontSize(9)
     .fillColor(COLORS.earthFlame)
     .text('יה חי! HalleluYah! 🕊️',
           0, doc.page.height - 25, { align: 'center', width: doc.page.width });
}