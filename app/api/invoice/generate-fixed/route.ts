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
  subtotal?: number;
  vat?: number;
  deliveryFee?: number;
  total?: number;
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
    
    // Calculate totals
    const subtotal = invoiceData.subtotal || invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = invoiceData.vat || (subtotal * 0.17);
    const deliveryFee = invoiceData.deliveryFee || 0;
    const total = invoiceData.total || (subtotal + vat + deliveryFee);
    
    // Generate QR code
    const qrData = {
      type: 'kfar_invoice',
      invoiceNumber,
      amount: total,
      vendorId: invoiceData.vendorId,
      orderId: invoiceData.orderId,
      paymentUrl: `https://kfar-final.vercel.app/pay/${invoiceNumber}`
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 100,
      margin: 1,
      color: {
        dark: COLORS.black,
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
    
    // Current Y position tracker
    let currentY = 50;
    
    // ============= HEADER SECTION =============
    // Add logo
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'kfar_icon_leaf_green.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, currentY, { width: 50, height: 50 });
    }
    
    // Company name
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .fillColor(COLORS.leafGreen)
       .text('KFAR', 110, currentY + 10);
    
    doc.fontSize(12)
       .fillColor(COLORS.sunGold)
       .text('MARKETPLACE', 175, currentY + 12);
    
    // Tagline
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor(COLORS.darkGray)
       .text(isHebrew ? 'הכפר כולו, ביד שלך' : 'The Whole Village, In Your Hand', 110, currentY + 32);
    
    // Invoice label (right side)
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor(COLORS.black)
       .text(isHebrew ? 'חשבונית מס' : 'TAX INVOICE', 400, currentY + 10, { 
         width: 150, 
         align: 'right' 
       });
    
    currentY += 70;
    
    // Separator line
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .strokeColor(COLORS.lightGray)
       .lineWidth(1)
       .stroke();
    
    currentY += 20;
    
    // ============= INVOICE INFO SECTION =============
    // Invoice number
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(COLORS.darkGray)
       .text(isHebrew ? 'מספר חשבונית:' : 'Invoice Number:', 50, currentY);
    
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor(COLORS.earthFlame)
       .text(invoiceNumber, 150, currentY);
    
    // Date
    const date = new Date(invoiceData.createdAt || new Date()).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(COLORS.darkGray)
       .text(isHebrew ? 'תאריך:' : 'Date:', 400, currentY);
    
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor(COLORS.black)
       .text(date, 450, currentY);
    
    currentY += 30;
    
    // ============= BILLING SECTION =============
    // Customer details
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor(COLORS.leafGreen)
       .text(isHebrew ? 'פרטי לקוח' : 'BILL TO', 50, currentY);
    
    currentY += 20;
    
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(COLORS.black);
    
    doc.text(invoiceData.customer.name, 50, currentY);
    currentY += 15;
    doc.text(invoiceData.customer.email, 50, currentY);
    currentY += 15;
    doc.text(invoiceData.customer.phone, 50, currentY);
    if (invoiceData.customer.address) {
      currentY += 15;
      doc.text(invoiceData.customer.address, 50, currentY);
    }
    
    // Vendor details (same Y level as customer)
    let vendorY = currentY - 45; // Go back to section header level
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor(COLORS.sunGold)
       .text(isHebrew ? 'פרטי ספק' : 'VENDOR', 320, vendorY);
    
    vendorY += 20;
    
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(COLORS.black);
    
    doc.text(invoiceData.vendorName, 320, vendorY);
    vendorY += 15;
    
    if (invoiceData.itemsByVendor && Object.keys(invoiceData.itemsByVendor).length > 1) {
      doc.fontSize(9)
         .fillColor(COLORS.earthFlame)
         .text(`+ ${Object.keys(invoiceData.itemsByVendor).length - 1} ${isHebrew ? 'ספקים נוספים' : 'additional vendors'}`, 320, vendorY);
      vendorY += 15;
    }
    
    doc.fontSize(9)
       .fillColor(COLORS.darkGray)
       .text(`${isHebrew ? 'משלוח:' : 'Delivery:'} ${invoiceData.deliveryMethod}`, 320, vendorY);
    vendorY += 12;
    doc.text(`${isHebrew ? 'תשלום:' : 'Payment:'} ${invoiceData.paymentMethod}`, 320, vendorY);
    
    // Update currentY to the lowest point
    currentY = Math.max(currentY, vendorY) + 30;
    
    // ============= ITEMS TABLE =============
    // Table header
    doc.rect(50, currentY, 500, 25)
       .fill(COLORS.leafGreen);
    
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor(COLORS.white);
    
    doc.text(isHebrew ? 'מוצר' : 'Item Description', 55, currentY + 7, { width: 250 });
    doc.text(isHebrew ? 'כמות' : 'Qty', 320, currentY + 7, { width: 50 });
    doc.text(isHebrew ? 'מחיר' : 'Price', 400, currentY + 7, { width: 60 });
    doc.text(isHebrew ? 'סה"כ' : 'Total', 480, currentY + 7, { width: 60 });
    
    currentY += 25;
    
    // Items
    if (invoiceData.itemsByVendor && Object.keys(invoiceData.itemsByVendor).length > 0) {
      Object.entries(invoiceData.itemsByVendor).forEach(([vendor, items]: [string, any]) => {
        // Check for page break
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
        
        // Vendor header
        doc.rect(50, currentY, 500, 20)
           .fill(COLORS.herbalMint);
        
        doc.font('Helvetica-Bold')
           .fontSize(9)
           .fillColor(COLORS.soilBrown)
           .text(`📦 ${vendor}`, 55, currentY + 5);
        
        currentY += 20;
        
        // Vendor items
        items.forEach((item: any, index: number) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
          
          // Alternate row background
          if (index % 2 === 0) {
            doc.rect(50, currentY, 500, 20)
               .fill(COLORS.creamBase);
          }
          
          doc.font('Helvetica')
             .fontSize(9)
             .fillColor(COLORS.black);
          
          doc.text(item.name, 55, currentY + 5, { width: 250 });
          doc.text(item.quantity.toString(), 320, currentY + 5);
          doc.text(`₪${item.price.toFixed(2)}`, 400, currentY + 5);
          doc.text(`₪${(item.price * item.quantity).toFixed(2)}`, 480, currentY + 5);
          
          currentY += 20;
        });
        
        currentY += 10; // Space between vendors
      });
    } else {
      // Regular items list
      invoiceData.items.forEach((item, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
        
        if (index % 2 === 0) {
          doc.rect(50, currentY, 500, 20)
             .fill(COLORS.creamBase);
        }
        
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor(COLORS.black);
        
        doc.text(item.name, 55, currentY + 5, { width: 250 });
        doc.text(item.quantity.toString(), 320, currentY + 5);
        doc.text(`₪${item.price.toFixed(2)}`, 400, currentY + 5);
        doc.text(`₪${(item.price * item.quantity).toFixed(2)}`, 480, currentY + 5);
        
        currentY += 20;
      });
    }
    
    currentY += 20;
    
    // ============= PAYMENT SUMMARY =============
    // Make sure we have space for summary
    if (currentY > 600) {
      doc.addPage();
      currentY = 50;
    }
    
    // Separator
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .strokeColor(COLORS.lightGray)
       .lineWidth(1)
       .stroke();
    
    currentY += 20;
    
    // QR Code
    const base64Data = qrCodeDataUrl.split(',')[1];
    const qrBuffer = Buffer.from(base64Data, 'base64');
    doc.image(qrBuffer, 50, currentY, { width: 80, height: 80 });
    
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor(COLORS.darkGray)
       .text(isHebrew ? 'סרוק לתשלום' : 'Scan to pay', 50, currentY + 85, { 
         width: 80, 
         align: 'center' 
       });
    
    // Summary on the right
    let summaryY = currentY;
    
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(COLORS.darkGray);
    
    // Subtotal
    doc.text(isHebrew ? 'סכום ביניים:' : 'Subtotal:', 350, summaryY);
    doc.text(`₪${subtotal.toFixed(2)}`, 480, summaryY, { width: 70, align: 'right' });
    
    summaryY += 20;
    
    // VAT
    doc.text(isHebrew ? 'מע"מ (17%):' : 'VAT (17%):', 350, summaryY);
    doc.text(`₪${vat.toFixed(2)}`, 480, summaryY, { width: 70, align: 'right' });
    
    // Delivery
    if (deliveryFee > 0) {
      summaryY += 20;
      doc.text(isHebrew ? 'דמי משלוח:' : 'Delivery:', 350, summaryY);
      doc.text(`₪${deliveryFee.toFixed(2)}`, 480, summaryY, { width: 70, align: 'right' });
    }
    
    summaryY += 30;
    
    // Total box
    doc.rect(340, summaryY - 5, 210, 30)
       .fill(COLORS.earthFlame);
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor(COLORS.white);
    
    doc.text(isHebrew ? 'סה"כ לתשלום:' : 'Total Due:', 350, summaryY + 5);
    doc.text(`₪${total.toFixed(2)}`, 470, summaryY + 5, { width: 70, align: 'right' });
    
    // ============= FOOTER =============
    // Position footer at bottom of page
    const footerY = 750;
    
    // Separator
    doc.moveTo(50, footerY)
       .lineTo(550, footerY)
       .strokeColor(COLORS.lightGray)
       .lineWidth(0.5)
       .stroke();
    
    // Thank you
    doc.font('Helvetica-Bold')
       .fontSize(11)
       .fillColor(COLORS.leafGreen)
       .text(isHebrew ? 'תודה שבחרתם ב-KFAR! 🌱' : 'Thank you for choosing KFAR! 🌱', 
             50, footerY + 15, { width: 500, align: 'center' });
    
    // Contact
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor(COLORS.darkGray)
       .text(isHebrew ? 'לשאלות: support@kfar.market | 052-KFAR-MKT' : 
                        'Questions? support@kfar.market | 052-KFAR-MKT',
             50, footerY + 35, { width: 500, align: 'center' });
    
    // Legal
    doc.fontSize(8)
       .fillColor(COLORS.lightGray)
       .text(isHebrew ? 'חשבונית זו הופקה אוטומטית ומהווה אסמכתא לתשלום' :
                        'This invoice was generated automatically and serves as proof of payment',
             50, footerY + 50, { width: 500, align: 'center' });
    
    // Finalize
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