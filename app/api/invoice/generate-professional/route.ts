import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// KFAR Brand Colors
const COLORS = {
  leafGreen: '#478c0b',
  sunGold: '#f6af0d',
  earthFlame: '#c23c09',
  creamBase: '#fef9ef',
  soilBrown: '#3a3a1d',
  herbalMint: '#cfe7c1',
  white: '#ffffff',
  lightGray: '#e5e7eb',
  darkGray: '#4b5563',
  black: '#000000'
};

// 8-point grid spacing system
const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48
};

// Typography sizes following best practices
const FONT_SIZES = {
  title: 24,
  heading: 16,
  subheading: 14,
  body: 11,
  caption: 9,
  small: 8
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
    
    // Generate QR code
    const qrData = {
      type: 'kfar_invoice',
      invoiceNumber,
      amount: invoiceData.total,
      vendorId: invoiceData.vendorId,
      orderId: invoiceData.orderId,
      paymentUrl: `https://kfar-final.vercel.app/pay/${invoiceNumber}`
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 120,
      margin: 1,
      color: {
        dark: COLORS.soilBrown,
        light: COLORS.white
      }
    });
    
    // Create PDF with proper margins
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      autoFirstPage: true
    });
    
    // Collect PDF chunks
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Professional Header with logo
    addProfessionalHeader(doc, invoiceData, invoiceNumber, isHebrew);
    
    // Invoice Details Section
    addInvoiceDetails(doc, invoiceData, invoiceNumber, isHebrew);
    
    // Customer and Vendor Information with proper spacing
    addBillingSection(doc, invoiceData, isHebrew);
    
    // Items Table with vendor grouping
    addItemsSection(doc, invoiceData, isHebrew);
    
    // Payment Summary with QR code
    addPaymentSection(doc, invoiceData, qrCodeDataUrl, isHebrew);
    
    // Professional Footer
    addProfessionalFooter(doc, isHebrew);
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF generation
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    
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

function addProfessionalHeader(doc: PDFKit.PDFDocument, data: InvoiceData, invoiceNumber: string, isHebrew: boolean) {
  const pageWidth = doc.page.width - 100; // Account for margins
  
  // Add logo if it exists
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'kfar_icon_leaf_green.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 60, height: 60 });
  }
  
  // Company name and tagline
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.title)
     .fillColor(COLORS.leafGreen)
     .text('KFAR', 120, 50, { continued: true });
  
  doc.fontSize(FONT_SIZES.subheading)
     .fillColor(COLORS.sunGold)
     .text(' MARKETPLACE', { continued: false });
  
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.caption)
     .fillColor(COLORS.darkGray)
     .text(isHebrew ? 'הכפר כולו, ביד שלך' : 'The Whole Village, In Your Hand', 120, 75);
  
  // Invoice label on the right
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.heading)
     .fillColor(COLORS.black)
     .text(isHebrew ? 'חשבונית מס' : 'TAX INVOICE', 400, 50, { 
       width: 150, 
       align: 'right' 
     });
  
  // Separator line
  doc.moveTo(50, 110)
     .lineTo(550, 110)
     .strokeColor(COLORS.lightGray)
     .lineWidth(1)
     .stroke();
}

function addInvoiceDetails(doc: PDFKit.PDFDocument, data: InvoiceData, invoiceNumber: string, isHebrew: boolean) {
  const y = 130;
  
  // Invoice number and date in a clean layout
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.body)
     .fillColor(COLORS.darkGray);
  
  // Left side - Invoice number
  doc.text(isHebrew ? 'מספר חשבונית:' : 'Invoice Number:', 50, y);
  doc.font('Helvetica-Bold')
     .fillColor(COLORS.earthFlame)
     .text(invoiceNumber, 150, y);
  
  // Right side - Date
  const date = new Date(data.createdAt || new Date()).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
  doc.font('Helvetica')
     .fillColor(COLORS.darkGray)
     .text(isHebrew ? 'תאריך:' : 'Date:', 400, y);
  doc.font('Helvetica-Bold')
     .fillColor(COLORS.black)
     .text(date, 450, y);
}

function addBillingSection(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  const startY = 170;
  const columnWidth = 250;
  
  // Customer section
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.subheading)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'פרטי לקוח' : 'BILL TO', 50, startY);
  
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.body)
     .fillColor(COLORS.black);
  
  let customerY = startY + SPACING.sm;
  doc.text(data.customer.name, 50, customerY);
  customerY += FONT_SIZES.body + 4;
  doc.text(data.customer.email, 50, customerY);
  customerY += FONT_SIZES.body + 4;
  doc.text(data.customer.phone, 50, customerY);
  if (data.customer.address) {
    customerY += FONT_SIZES.body + 4;
    doc.text(data.customer.address, 50, customerY);
  }
  
  // Vendor section
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.subheading)
     .fillColor(COLORS.sunGold)
     .text(isHebrew ? 'פרטי ספק' : 'VENDOR', 320, startY);
  
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.body)
     .fillColor(COLORS.black);
  
  let vendorY = startY + SPACING.sm;
  doc.text(data.vendorName, 320, vendorY);
  
  // Multiple vendors indicator
  if (data.itemsByVendor && Object.keys(data.itemsByVendor).length > 1) {
    vendorY += FONT_SIZES.body + 4;
    doc.fontSize(FONT_SIZES.caption)
       .fillColor(COLORS.earthFlame)
       .text(`+ ${Object.keys(data.itemsByVendor).length - 1} ${isHebrew ? 'ספקים נוספים' : 'additional vendors'}`, 320, vendorY);
  }
  
  vendorY += FONT_SIZES.body + 8;
  doc.fontSize(FONT_SIZES.caption)
     .fillColor(COLORS.darkGray)
     .text(`${isHebrew ? 'משלוח:' : 'Delivery:'} ${data.deliveryMethod}`, 320, vendorY);
  vendorY += FONT_SIZES.caption + 4;
  doc.text(`${isHebrew ? 'תשלום:' : 'Payment:'} ${data.paymentMethod}`, 320, vendorY);
}

function addItemsSection(doc: PDFKit.PDFDocument, data: InvoiceData, isHebrew: boolean) {
  let tableTop = 290;
  const pageHeight = doc.page.height - 100;
  
  // Table header
  const headerHeight = 30;
  doc.rect(50, tableTop, 500, headerHeight)
     .fill(COLORS.leafGreen);
  
  // Column positions
  const cols = {
    item: 55,
    qty: 320,
    price: 400,
    total: 480
  };
  
  // Header text
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.body)
     .fillColor(COLORS.white);
  
  doc.text(isHebrew ? 'מוצר' : 'Item Description', cols.item, tableTop + 8);
  doc.text(isHebrew ? 'כמות' : 'Qty', cols.qty, tableTop + 8);
  doc.text(isHebrew ? 'מחיר' : 'Price', cols.price, tableTop + 8);
  doc.text(isHebrew ? 'סה"כ' : 'Total', cols.total, tableTop + 8);
  
  let yPosition = tableTop + headerHeight;
  
  // Group items by vendor if available
  if (data.itemsByVendor && Object.keys(data.itemsByVendor).length > 0) {
    Object.entries(data.itemsByVendor).forEach(([vendor, items]: [string, any], vendorIndex) => {
      // Check for page break
      if (yPosition > pageHeight - 150) {
        doc.addPage();
        yPosition = 50;
      }
      
      // Vendor header
      doc.rect(50, yPosition, 500, 20)
         .fill(COLORS.herbalMint);
      
      doc.font('Helvetica-Bold')
         .fontSize(FONT_SIZES.caption)
         .fillColor(COLORS.soilBrown)
         .text(`📦 ${vendor}`, cols.item, yPosition + 5);
      
      yPosition += 25;
      
      // Vendor items
      doc.font('Helvetica')
         .fontSize(FONT_SIZES.body);
      
      items.forEach((item: any, index: number) => {
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, yPosition, 500, 20)
             .fill(COLORS.creamBase);
        }
        
        doc.fillColor(COLORS.black);
        doc.text(item.name, cols.item, yPosition + 3, { width: 250 });
        doc.text(item.quantity.toString(), cols.qty, yPosition + 3);
        doc.text(`₪${item.price.toFixed(2)}`, cols.price, yPosition + 3);
        doc.text(`₪${(item.price * item.quantity).toFixed(2)}`, cols.total, yPosition + 3);
        
        yPosition += 22;
      });
      
      yPosition += 8; // Space between vendors
    });
  } else {
    // Fallback to regular items list
    data.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, yPosition, 500, 20)
           .fill(COLORS.creamBase);
      }
      
      doc.fillColor(COLORS.black)
         .fontSize(FONT_SIZES.body);
      doc.text(item.name, cols.item, yPosition + 3, { width: 250 });
      doc.text(item.quantity.toString(), cols.qty, yPosition + 3);
      doc.text(`₪${item.price.toFixed(2)}`, cols.price, yPosition + 3);
      doc.text(`₪${(item.price * item.quantity).toFixed(2)}`, cols.total, yPosition + 3);
      
      yPosition += 22;
    });
  }
}

function addPaymentSection(doc: PDFKit.PDFDocument, data: InvoiceData, qrCodeDataUrl: string, isHebrew: boolean) {
  const pageHeight = doc.page.height;
  const startY = pageHeight - 280;
  
  // Separator line
  doc.moveTo(50, startY)
     .lineTo(550, startY)
     .strokeColor(COLORS.lightGray)
     .lineWidth(1)
     .stroke();
  
  // QR Code on the left
  const base64Data = qrCodeDataUrl.split(',')[1];
  const qrBuffer = Buffer.from(base64Data, 'base64');
  doc.image(qrBuffer, 50, startY + 20, { width: 100 });
  
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.caption)
     .fillColor(COLORS.darkGray)
     .text(isHebrew ? 'סרוק לתשלום' : 'Scan to pay', 50, startY + 125, { 
       width: 100, 
       align: 'center' 
     });
  
  // Calculate totals with fallbacks
  const subtotal = data.subtotal || data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatAmount = data.vat || (subtotal * 0.17) || 0;
  const deliveryFee = data.deliveryFee || 0;
  const total = data.total || (subtotal + vatAmount + deliveryFee);
  
  // Payment summary on the right
  let yPos = startY + 20;
  const labelX = 350;
  const valueX = 480;
  
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.body)
     .fillColor(COLORS.darkGray);
  
  // Subtotal
  doc.text(isHebrew ? 'סכום ביניים:' : 'Subtotal:', labelX, yPos);
  doc.text(`₪${subtotal.toFixed(2)}`, valueX, yPos, { align: 'right' });
  
  // VAT
  yPos += SPACING.sm;
  doc.text(isHebrew ? 'מע"מ (17%):' : 'VAT (17%):', labelX, yPos);
  doc.text(`₪${vatAmount.toFixed(2)}`, valueX, yPos, { align: 'right' });
  
  // Delivery
  if (deliveryFee > 0) {
    yPos += SPACING.sm;
    doc.text(isHebrew ? 'דמי משלוח:' : 'Delivery:', labelX, yPos);
    doc.text(`₪${deliveryFee.toFixed(2)}`, valueX, yPos, { align: 'right' });
  }
  
  // Total - emphasized
  yPos += SPACING.md;
  doc.rect(340, yPos - 5, 210, 30)
     .fill(COLORS.earthFlame);
  
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.subheading)
     .fillColor(COLORS.white);
  doc.text(isHebrew ? 'סה"כ לתשלום:' : 'Total Due:', labelX + 10, yPos + 3);
  doc.text(`₪${total.toFixed(2)}`, valueX, yPos + 3, { align: 'right' });
}

function addProfessionalFooter(doc: PDFKit.PDFDocument, isHebrew: boolean) {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 120;
  
  // Separator line
  doc.moveTo(50, footerY)
     .lineTo(550, footerY)
     .strokeColor(COLORS.lightGray)
     .lineWidth(0.5)
     .stroke();
  
  // Thank you message
  doc.font('Helvetica-Bold')
     .fontSize(FONT_SIZES.body)
     .fillColor(COLORS.leafGreen)
     .text(isHebrew ? 'תודה שבחרתם ב-KFAR! 🌱' : 'Thank you for choosing KFAR! 🌱', 
           50, footerY + 15, { align: 'center', width: 500 });
  
  // Contact info
  doc.font('Helvetica')
     .fontSize(FONT_SIZES.caption)
     .fillColor(COLORS.darkGray)
     .text(isHebrew ? 'לשאלות: support@kfar.market | 052-KFAR-MKT' : 
                      'Questions? support@kfar.market | 052-KFAR-MKT',
           50, footerY + 35, { align: 'center', width: 500 });
  
  // Legal text
  doc.fontSize(FONT_SIZES.small)
     .fillColor(COLORS.lightGray)
     .text(isHebrew ? 'חשבונית זו הופקה אוטומטית ומהווה אסמכתא לתשלום' :
                      'This invoice was generated automatically and serves as proof of payment',
           50, footerY + 55, { align: 'center', width: 500 });
  
  // Community message
  doc.fontSize(FONT_SIZES.caption)
     .fillColor(COLORS.earthFlame)
     .text('Village of Peace • Dimona • Israel',
           50, footerY + 70, { align: 'center', width: 500 });
}