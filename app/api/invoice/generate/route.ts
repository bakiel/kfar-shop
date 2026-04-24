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
  }>;
  subtotal: number;
  vat: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
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
    
    // Create PDF document with built-in fonts
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      autoFirstPage: true
    });
    
    // Collect PDF chunks
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // PDF Header
    addHeader(doc, invoiceData, invoiceNumber, isHebrew);
    
    // QR Code Section
    addQRCodeSection(doc, qrCodeDataUrl, invoiceNumber, isHebrew);
    
    // Customer Information
    addCustomerInfo(doc, invoiceData, isHebrew);
    
    // Items Table
    addItemsTable(doc, invoiceData, isHebrew);
    
    // Totals Section
    addTotalsSection(doc, invoiceData, isHebrew);
    
    // Footer
    addFooter(doc, isHebrew);
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    
    // Convert to base64 for easy transmission
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Return both PDF and metadata
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

function addHeader(doc: PDFKit.PDFDocument, data: InvoiceData, invoiceNumber: string, isHebrew: boolean) {
  // Background header
  doc.rect(0, 0, doc.page.width, 120).fill(COLORS.creamBase);
  
  // Set font explicitly
  doc.font('Helvetica-Bold');
  
  // Company name and logo area
  doc.fontSize(28)
     .fillColor(COLORS.leafGreen)
     .text('KFAR', 50, 40, { continued: true })
     .fillColor(COLORS.sunGold)
     .fontSize(14)
     .text(' MARKETPLACE', { continued: false });
  
  doc.font('Helvetica');
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'הכפר כולו, ביד שלך' : 'The Whole Village, In Your Hand', 50, 75);
  
  // Invoice title and number
  doc.fontSize(20)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'חשבונית מס' : 'INVOICE', 400, 40, { align: 'right' });
  
  doc.fontSize(12)
     .fillColor(COLORS.earthFlame)
     .text(`#${invoiceNumber}`, 400, 68, { align: 'right' });
  
  // Date
  const date = new Date(data.createdAt).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(`${isHebrew ? 'תאריך:' : 'Date:'} ${date}`, 400, 88, { align: 'right' });
}

function addQRCodeSection(doc: PDFKit.PDFDocument, qrCodeDataUrl: string, invoiceNumber: string, isHebrew: boolean) {
  // QR Code with payment info
  doc.moveDown(2);
  
  // Set font explicitly
  doc.font('Helvetica-Bold');
  
  // Section title
  doc.fontSize(14)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'סרוק לתשלום מהיר' : 'SCAN TO PAY', 420, 140);
  
  // Extract base64 data from dataURL
  const base64Data = qrCodeDataUrl.split(',')[1];
  const qrBuffer = Buffer.from(base64Data, 'base64');
  
  // Add QR code image
  doc.image(qrBuffer, 420, 165, { width: 120 });
  
  // QR instructions
  doc.font('Helvetica');
  doc.fontSize(8)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'סרוק עם האפליקציה' : 'Scan with app', 420, 290, { width: 120, align: 'center' });
}

function addCustomerInfo(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  // Set font explicitly
  doc.font('Helvetica-Bold');
  
  // Customer section
  doc.fontSize(12)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'פרטי לקוח' : 'BILL TO', 50, 140);
  
  // Green accent line
  doc.moveTo(50, 158)
     .lineTo(150, 158)
     .strokeColor(COLORS.leafGreen)
     .lineWidth(2)
     .stroke();
  
  // Customer details
  doc.font('Helvetica');
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(data.customer.name, 50, 170)
     .text(data.customer.email, 50, 185)
     .text(data.customer.phone, 50, 200);
  
  if (data.customer.address) {
    doc.text(data.customer.address, 50, 215);
  }
  
  // Vendor info
  doc.fontSize(12)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'פרטי ספק' : 'VENDOR', 250, 140);
  
  doc.moveTo(250, 158)
     .lineTo(350, 158)
     .strokeColor(COLORS.leafGreen)
     .lineWidth(2)
     .stroke();
  
  doc.fontSize(10)
     .fillColor(COLORS.soilBrown)
     .text(data.vendorName, 250, 170)
     .text(`${isHebrew ? 'אופן משלוח:' : 'Delivery:'} ${data.deliveryMethod}`, 250, 185)
     .text(`${isHebrew ? 'אופן תשלום:' : 'Payment:'} ${data.paymentMethod}`, 250, 200);
}

function addItemsTable(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  // Set font explicitly
  doc.font('Helvetica');
  
  const tableTop = 320;
  const col1 = 50;
  const col2 = 280;
  const col3 = 360;
  const col4 = 440;
  
  // Table header
  doc.rect(50, tableTop, 500, 25).fill(COLORS.leafGreen);
  
  // Header text
  doc.fontSize(10).fillColor(COLORS.white);
  
  if (isHebrew) {
    doc.text('מוצר', col1 + 5, tableTop + 7, { width: 220 });
    doc.text('כמות', col2 + 5, tableTop + 7);
    doc.text('מחיר', col3 + 5, tableTop + 7);
    doc.text('סה"כ', col4 + 5, tableTop + 7);
  } else {
    doc.text('Product', col1 + 5, tableTop + 7, { width: 220 });
    doc.text('Qty', col2 + 5, tableTop + 7);
    doc.text('Price', col3 + 5, tableTop + 7);
    doc.text('Total', col4 + 5, tableTop + 7);
  }
  
  // Items
  let yPosition = tableTop + 30;
  doc.fillColor(COLORS.soilBrown);
  
  data.items.forEach((item, index) => {
    // Alternate row backgrounds
    if (index % 2 === 0) {
      doc.rect(50, yPosition - 5, 500, 25).fill(COLORS.creamBase);
      doc.fillColor(COLORS.soilBrown);
    }
    
    const itemName = isHebrew && item.nameHe ? item.nameHe : item.name;
    const price = `₪${item.price.toFixed(2)}`;
    const total = `₪${(item.price * item.quantity).toFixed(2)}`;
    
    doc.fontSize(9);
    doc.text(itemName, col1 + 5, yPosition, { width: 220 });
    doc.text(item.quantity.toString(), col2 + 5, yPosition);
    doc.text(price, col3 + 5, yPosition);
    doc.text(total, col4 + 5, yPosition);
    
    yPosition += 25;
  });
}

function addTotalsSection(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  // Set font explicitly
  doc.font('Helvetica');
  
  const yStart = 480;
  
  // Separator line
  doc.moveTo(300, yStart)
     .lineTo(550, yStart)
     .strokeColor(COLORS.lightGray)
     .lineWidth(1)
     .stroke();
  
  let yPos = yStart + 20;
  doc.fontSize(10).fillColor(COLORS.soilBrown);
  
  // Calculate totals if not provided
  const subtotal = data.subtotal || data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Subtotal
  doc.text(isHebrew ? 'סכום ביניים:' : 'Subtotal:', 380, yPos);
  doc.text(`₪${subtotal.toFixed(2)}`, 480, yPos, { align: 'right' });
  
  // VAT
  yPos += 20;
  const vatAmount = data.vat || (subtotal * 0.17) || 0;
  doc.text(isHebrew ? 'מע"מ (17%):' : 'VAT (17%):', 380, yPos);
  doc.text(`₪${vatAmount.toFixed(2)}`, 480, yPos, { align: 'right' });
  
  // Delivery
  const deliveryFee = data.deliveryFee || 0;
  if (deliveryFee > 0) {
    yPos += 20;
    doc.text(isHebrew ? 'דמי משלוח:' : 'Delivery:', 380, yPos);
    doc.text(`₪${deliveryFee.toFixed(2)}`, 480, yPos, { align: 'right' });
  }
  
  // Calculate total if not provided
  const total = data.total || (subtotal + vatAmount + deliveryFee);
  
  // Total - highlighted
  yPos += 30;
  doc.rect(370, yPos - 5, 180, 30).fill(COLORS.earthFlame);
  
  doc.fontSize(12)
     .fillColor(COLORS.white)
     .text(isHebrew ? 'סה"כ לתשלום:' : 'Total Due:', 380, yPos + 3);
  doc.text(`₪${total.toFixed(2)}`, 480, yPos + 3, { align: 'right' });
}

function addFooter(doc: PDFKit.PDFDocument, isHebrew: boolean) {
  // Set font explicitly
  doc.font('Helvetica');
  
  const leafY = doc.page.height - 120;
  
  // Thank you message
  doc.fontSize(12)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'תודה שבחרתם ב-KFAR! 🌱' : 'Thank you for choosing KFAR! 🌱', 
           0, leafY + 20, { align: 'center', width: doc.page.width });
  
  // Contact info
  doc.fontSize(9)
     .fillColor(COLORS.soilBrown)
     .text(isHebrew ? 'לשאלות: support@kfar.market | 08-123-4567' : 
                      'Questions? support@kfar.market | 08-123-4567',
           0, leafY + 40, { align: 'center', width: doc.page.width });
  
  // Legal text
  doc.fontSize(8)
     .fillColor(COLORS.lightGray)
     .text(isHebrew ? 'חשבונית זו הופקה אוטומטית ומהווה אסמכתא לתשלום' :
                      'This invoice was generated automatically and serves as proof of payment',
           0, doc.page.height - 40, { align: 'center', width: doc.page.width });
}