const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

class KFARInvoiceGenerator {
  constructor() {
    // Use the master branding logo paths as documented in CLAUDE.md
    this.logoPath = '/Users/mac/Downloads/kfar-final/kfar-master-branding/all-kfar-logos/kfar_logo_primary_horizontal.png';
    this.leafIconPath = '/Users/mac/Downloads/kfar-final/kfar-master-branding/all-kfar-logos/kfar_icon_leaf_green.png';
  }

  async generateInvoice(orderData, language = 'en') {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    // Store the PDF in memory
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    // Set up fonts for Hebrew support
    if (language === 'he') {
      // For Hebrew, we'll use the default font with RTL text handling
      doc.font('Helvetica');
    }

    // Initialize document
    this.setupDocument(doc);
    
    // Add content sections
    await this.addHeader(doc, orderData, language);
    this.addCustomerInfo(doc, orderData, language);
    this.addOrderDetails(doc, orderData, language);
    this.addItemsTable(doc, orderData, language);
    this.addTotalSection(doc, orderData, language);
    this.addFooter(doc, orderData, language);

    // Finalize the PDF
    doc.end();

    // Return buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
    });
  }

  setupDocument(doc) {
    // Add metadata
    doc.info.Title = 'KFAR Marketplace Invoice';
    doc.info.Author = 'KFAR Marketplace';
    doc.info.Subject = 'Order Invoice';
    doc.info.Creator = 'KFAR Invoice System';
  }

  async addHeader(doc, orderData, language) {
    const isHebrew = language === 'he';
    
    // Background header band
    doc.rect(0, 0, doc.page.width, 120)
       .fill(COLORS.creamBase);

    // Add logo (check if file exists first)
    try {
      if (fs.existsSync(this.logoPath)) {
        doc.image(this.logoPath, 50, 30, { width: 150 });
      } else {
        // Fallback: Text logo with brand colors
        doc.fontSize(24)
           .fillColor(COLORS.leafGreen)
           .text('KFAR', 50, 40, { continued: true })
           .fillColor(COLORS.sunGold)
           .fontSize(12)
           .text(' MARKETPLACE', { continued: false });
        
        doc.fontSize(10)
           .fillColor(COLORS.soilBrown)
           .text('The Whole Village, In Your Hand', 50, 70);
      }
    } catch (error) {
      console.error('Logo loading error:', error);
    }

    // Invoice title and number
    const invoiceText = isHebrew ? 'חשבונית מס' : 'INVOICE';
    const invoiceNumber = `#${orderData.invoiceNumber || orderData.orderId}`;
    
    doc.fontSize(20)
       .fillColor(COLORS.soilBrown)
       .text(invoiceText, 400, 40, { align: 'right' });
    
    doc.fontSize(14)
       .fillColor(COLORS.earthFlame)
       .text(invoiceNumber, 400, 70, { align: 'right' });

    // Date
    const dateText = isHebrew ? 'תאריך:' : 'Date:';
    const date = new Date(orderData.createdAt || Date.now()).toLocaleDateString(
      isHebrew ? 'he-IL' : 'en-US'
    );
    
    doc.fontSize(10)
       .fillColor(COLORS.soilBrown)
       .text(`${dateText} ${date}`, 400, 90, { align: 'right' });

    // Move cursor down
    doc.moveDown(3);
  }

  addCustomerInfo(doc, orderData, language) {
    const isHebrew = language === 'he';
    const customer = orderData.customer;
    
    // Section title with green accent line
    const billToText = isHebrew ? 'פרטי לקוח' : 'BILL TO';
    
    doc.fontSize(12)
       .fillColor(COLORS.leafGreen)
       .text(billToText, 50, 150);
    
    // Green accent line
    doc.moveTo(50, 170)
       .lineTo(150, 170)
       .strokeColor(COLORS.leafGreen)
       .lineWidth(2)
       .stroke();

    // Customer details
    doc.fontSize(10)
       .fillColor(COLORS.soilBrown)
       .text(customer.name, 50, 185)
       .text(customer.email, 50, 200)
       .text(customer.phone, 50, 215);

    if (customer.address) {
      doc.text(customer.address, 50, 230);
    }

    // Order method info (right side)
    const deliveryText = isHebrew ? 'אופן משלוח:' : 'Delivery Method:';
    const paymentText = isHebrew ? 'אופן תשלום:' : 'Payment Method:';
    
    doc.fontSize(10)
       .fillColor(COLORS.soilBrown)
       .text(deliveryText, 350, 185)
       .fillColor(COLORS.earthFlame)
       .text(orderData.deliveryMethod || 'Pickup', 350, 200)
       .fillColor(COLORS.soilBrown)
       .text(paymentText, 350, 220)
       .fillColor(COLORS.earthFlame)
       .text(orderData.paymentMethod || 'Bank Transfer', 350, 235);
  }

  addOrderDetails(doc, orderData, language) {
    const isHebrew = language === 'he';
    
    // Add some space
    doc.moveDown(2);
    
    // Order status badge
    const statusText = isHebrew ? 'סטטוס הזמנה:' : 'Order Status:';
    const status = orderData.status || 'confirmed';
    const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Status background
    doc.rect(50, 280, 120, 25)
       .fill(COLORS.herbalMint);
    
    doc.fontSize(10)
       .fillColor(COLORS.leafGreen)
       .text(`${statusText} ${statusDisplay}`, 55, 287);
  }

  addItemsTable(doc, orderData, language) {
    const isHebrew = language === 'he';
    const items = orderData.items || [];
    
    // Table headers
    const headers = isHebrew ? 
      ['סה"כ', 'מחיר', 'כמות', 'מוצר'] :
      ['Product', 'Qty', 'Price', 'Total'];
    
    // Table starting position
    let tableTop = 330;
    const col1 = 50;
    const col2 = 300;
    const col3 = 380;
    const col4 = 460;

    // Header background
    doc.rect(50, tableTop, 500, 25)
       .fill(COLORS.leafGreen);

    // Header text
    doc.fontSize(10)
       .fillColor(COLORS.white);

    if (isHebrew) {
      doc.text(headers[3], col1 + 5, tableTop + 7);
      doc.text(headers[2], col2 + 5, tableTop + 7);
      doc.text(headers[1], col3 + 5, tableTop + 7);
      doc.text(headers[0], col4 + 5, tableTop + 7);
    } else {
      doc.text(headers[0], col1 + 5, tableTop + 7);
      doc.text(headers[1], col2 + 5, tableTop + 7);
      doc.text(headers[2], col3 + 5, tableTop + 7);
      doc.text(headers[3], col4 + 5, tableTop + 7);
    }

    // Items
    let yPosition = tableTop + 30;
    doc.fillColor(COLORS.soilBrown);

    items.forEach((item, index) => {
      // Alternate row backgrounds
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 5, 500, 20)
           .fill(COLORS.creamBase);
        doc.fillColor(COLORS.soilBrown);
      }

      const itemName = item.name || item.productName;
      const vendorName = item.vendorName ? ` (${item.vendorName})` : '';
      const price = `₪${item.price.toFixed(2)}`;
      const total = `₪${(item.price * item.quantity).toFixed(2)}`;

      doc.fontSize(9);
      doc.text(itemName + vendorName, col1 + 5, yPosition, { width: 240 });
      doc.text(item.quantity.toString(), col2 + 5, yPosition);
      doc.text(price, col3 + 5, yPosition);
      doc.text(total, col4 + 5, yPosition);

      yPosition += 25;
    });

    return yPosition;
  }

  addTotalSection(doc, orderData, language) {
    const isHebrew = language === 'he';
    const yStart = 500;

    // Separator line
    doc.moveTo(300, yStart)
       .lineTo(550, yStart)
       .strokeColor(COLORS.lightGray)
       .lineWidth(1)
       .stroke();

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.17; // 17% Israeli VAT
    const delivery = orderData.deliveryFee || 0;
    const total = subtotal + vat + delivery;

    // Labels
    const labels = isHebrew ? 
      ['סכום ביניים:', 'מע"מ (17%):', 'דמי משלוח:', 'סה"כ לתשלום:'] :
      ['Subtotal:', 'VAT (17%):', 'Delivery:', 'Total Due:'];

    let yPos = yStart + 20;
    doc.fontSize(10)
       .fillColor(COLORS.soilBrown);

    // Subtotal
    doc.text(labels[0], 380, yPos);
    doc.text(`₪${subtotal.toFixed(2)}`, 480, yPos, { align: 'right' });

    // VAT
    yPos += 20;
    doc.text(labels[1], 380, yPos);
    doc.text(`₪${vat.toFixed(2)}`, 480, yPos, { align: 'right' });

    // Delivery
    if (delivery > 0) {
      yPos += 20;
      doc.text(labels[2], 380, yPos);
      doc.text(`₪${delivery.toFixed(2)}`, 480, yPos, { align: 'right' });
    }

    // Total - highlighted
    yPos += 30;
    doc.rect(370, yPos - 5, 180, 30)
       .fill(COLORS.earthFlame);

    doc.fontSize(12)
       .fillColor(COLORS.white)
       .text(labels[3], 380, yPos + 3);
    doc.text(`₪${total.toFixed(2)}`, 480, yPos + 3, { align: 'right' });
  }

  addFooter(doc, orderData, language) {
    const isHebrew = language === 'he';
    
    // Add leaf decoration
    const leafY = doc.page.height - 120;
    
    // Draw simple leaf shape with brand color
    doc.save();
    doc.translate(doc.page.width / 2, leafY);
    doc.path('M 0 0 Q -10 -20 0 -40 Q 10 -20 0 0')
       .fill(COLORS.leafGreen);
    doc.restore();

    // Thank you message
    const thankYouText = isHebrew ? 
      'תודה שבחרתם ב-KFAR! 🌱' : 
      'Thank you for choosing KFAR! 🌱';
    
    doc.fontSize(12)
       .fillColor(COLORS.leafGreen)
       .text(thankYouText, 0, leafY + 20, {
         align: 'center',
         width: doc.page.width
       });

    // Contact info
    const contactText = isHebrew ?
      'לשאלות: support@kfar.market | 08-123-4567' :
      'Questions? support@kfar.market | 08-123-4567';
    
    doc.fontSize(9)
       .fillColor(COLORS.soilBrown)
       .text(contactText, 0, leafY + 40, {
         align: 'center',
         width: doc.page.width
       });

    // Legal text
    const legalText = isHebrew ?
      'חשבונית זו הופקה אוטומטית ומהווה אסמכתא לתשלום' :
      'This invoice was generated automatically and serves as proof of payment';
    
    doc.fontSize(8)
       .fillColor(COLORS.lightGray)
       .text(legalText, 0, doc.page.height - 40, {
         align: 'center',
         width: doc.page.width
       });
  }
}

module.exports = new KFARInvoiceGenerator();