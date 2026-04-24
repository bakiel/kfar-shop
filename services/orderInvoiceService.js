const invoiceGenerator = require('./invoiceGenerator');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class OrderInvoiceService {
  /**
   * Generate and send invoice for an order
   * @param {Object} order - Order data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Result object
   */
  async generateAndSendInvoice(order, options = {}) {
    try {
      // Determine language
      const language = options.language || this.detectLanguage(order.customer);
      
      // Format order data for invoice
      const invoiceData = this.formatOrderData(order);
      
      // Generate PDF
      const pdfBuffer = await invoiceGenerator.generateInvoice(invoiceData, language);
      
      // Prepare email
      const emailData = this.prepareEmailData(order, invoiceData, pdfBuffer, language);
      
      // Send email
      const result = await this.sendInvoiceEmail(emailData);
      
      return {
        success: true,
        invoiceNumber: invoiceData.invoiceNumber,
        emailSent: true,
        messageId: result[0].messageId
      };
      
    } catch (error) {
      console.error('Invoice generation/sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format order data for invoice generation
   */
  formatOrderData(order) {
    // Generate invoice number with date prefix
    const date = new Date();
    const invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${order.id || order.orderId}`;
    
    return {
      invoiceNumber,
      orderId: order.id || order.orderId,
      createdAt: order.createdAt || new Date(),
      status: order.status || 'confirmed',
      customer: {
        name: order.customerName || order.customer?.name || 'Guest Customer',
        email: order.customerEmail || order.customer?.email || '',
        phone: order.customerPhone || order.customer?.phone || '',
        address: order.deliveryAddress || order.customer?.address || ''
      },
      items: this.formatOrderItems(order.items || []),
      deliveryMethod: order.deliveryMethod || 'pickup',
      paymentMethod: order.paymentMethod || 'bank_transfer',
      deliveryFee: order.deliveryFee || 0,
      notes: order.notes || ''
    };
  }

  /**
   * Format order items for invoice
   */
  formatOrderItems(items) {
    return items.map(item => ({
      name: item.productName || item.name,
      vendorName: item.vendorName || item.vendor?.name || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      total: (item.price || 0) * (item.quantity || 1)
    }));
  }

  /**
   * Detect language based on customer data
   */
  detectLanguage(customer) {
    // Simple detection based on phone number or name
    const phone = customer?.phone || '';
    const name = customer?.name || '';
    
    // If phone starts with +972 or contains Hebrew characters, use Hebrew
    if (phone.startsWith('+972') || /[\u0590-\u05FF]/.test(name)) {
      return 'he';
    }
    
    return 'en';
  }

  /**
   * Prepare email data with KFAR branding
   */
  prepareEmailData(order, invoiceData, pdfBuffer, language) {
    const isHebrew = language === 'he';
    
    // Email content with KFAR branding
    const subject = isHebrew ? 
      `חשבונית KFAR - הזמנה ${invoiceData.invoiceNumber}` :
      `KFAR Invoice - Order ${invoiceData.invoiceNumber}`;
    
    const html = this.generateEmailHTML(order, invoiceData, language);
    
    return {
      to: invoiceData.customer.email,
      from: {
        email: process.env.FROM_EMAIL || 'orders@kfar.market',
        name: 'KFAR Marketplace'
      },
      subject,
      html,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `KFAR-Invoice-${invoiceData.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };
  }

  /**
   * Generate branded email HTML
   */
  generateEmailHTML(order, invoiceData, language) {
    const isHebrew = language === 'he';
    
    return `
<!DOCTYPE html>
<html dir="${isHebrew ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KFAR Invoice</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #fef9ef; padding: 30px; text-align: center;">
              <h1 style="color: #478c0b; margin: 0; font-size: 28px;">KFAR MARKETPLACE</h1>
              <p style="color: #f6af0d; margin: 10px 0 0 0; font-size: 14px;">The Whole Village, In Your Hand</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #3a3a1d; margin: 0 0 20px 0; font-size: 22px;">
                ${isHebrew ? `שלום ${invoiceData.customer.name}!` : `Hello ${invoiceData.customer.name}!`}
              </h2>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                ${isHebrew ? 
                  `תודה על ההזמנה שלך! מצורפת חשבונית עבור הזמנה מספר ${invoiceData.invoiceNumber}.` :
                  `Thank you for your order! Your invoice for order ${invoiceData.invoiceNumber} is attached.`}
              </p>
              
              <!-- Order Summary -->
              <div style="background-color: #fef9ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #478c0b; margin: 0 0 15px 0; font-size: 18px;">
                  ${isHebrew ? 'סיכום הזמנה' : 'Order Summary'}
                </h3>
                
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #3a3a1d; font-weight: bold;">
                      ${isHebrew ? 'מספר פריטים:' : 'Items:'}
                    </td>
                    <td style="color: #666666; text-align: ${isHebrew ? 'left' : 'right'};">
                      ${invoiceData.items.length}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #3a3a1d; font-weight: bold;">
                      ${isHebrew ? 'אופן משלוח:' : 'Delivery:'}
                    </td>
                    <td style="color: #666666; text-align: ${isHebrew ? 'left' : 'right'};">
                      ${invoiceData.deliveryMethod}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #3a3a1d; font-weight: bold;">
                      ${isHebrew ? 'סטטוס:' : 'Status:'}
                    </td>
                    <td style="color: #478c0b; font-weight: bold; text-align: ${isHebrew ? 'left' : 'right'};">
                      ${invoiceData.status}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://kfar.market/orders/${invoiceData.orderId}" 
                   style="display: inline-block; background-color: #c23c09; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  ${isHebrew ? 'צפה בהזמנה' : 'View Order'}
                </a>
              </div>
              
              <!-- Support -->
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                ${isHebrew ? 
                  'יש לך שאלות? צור קשר איתנו בכתובת support@kfar.market' :
                  'Have questions? Contact us at support@kfar.market'}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #478c0b; padding: 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">
                ${isHebrew ? 'תודה שבחרת ב-KFAR! 🌱' : 'Thank you for choosing KFAR! 🌱'}
              </p>
              <p style="color: #cfe7c1; margin: 10px 0 0 0; font-size: 12px;">
                ${isHebrew ? 
                  'שוק טבעוני אותנטי | כפר השלום, דימונה' :
                  'Authentic Vegan Marketplace | Village of Peace, Dimona'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Send invoice email via SendGrid
   */
  async sendInvoiceEmail(emailData) {
    try {
      const result = await sgMail.send(emailData);
      console.log('Invoice email sent successfully:', emailData.to);
      return result;
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
  }

  /**
   * Generate invoice without sending (for preview/download)
   */
  async generateInvoiceOnly(order, language = 'en') {
    const invoiceData = this.formatOrderData(order);
    const pdfBuffer = await invoiceGenerator.generateInvoice(invoiceData, language);
    
    return {
      buffer: pdfBuffer,
      invoiceNumber: invoiceData.invoiceNumber,
      filename: `KFAR-Invoice-${invoiceData.invoiceNumber}.pdf`
    };
  }
}

module.exports = new OrderInvoiceService();