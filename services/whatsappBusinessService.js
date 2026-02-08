const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

// Initialize services
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class WhatsAppBusinessService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = twilio(this.accountSid, this.authToken);
    
    // WhatsApp numbers
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    this.smsNumber = process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER;
    
    // Message templates (pre-approved for WhatsApp Business)
    this.templates = {
      order_confirmation: {
        he: {
          template: 'שלום {{1}}! ההזמנה {{2}} התקבלה. סה"כ: ₪{{3}}. פרטים נוספים נשלחו למייל.',
          params: ['customerName', 'orderId', 'total']
        },
        en: {
          template: 'Hello {{1}}! Order {{2}} received. Total: ₪{{3}}. Details sent to email.',
          params: ['customerName', 'orderId', 'total']
        }
      },
      payment_confirmed: {
        he: {
          template: 'התשלום עבור הזמנה {{1}} התקבל בהצלחה. הספקים החלו להכין את ההזמנה.',
          params: ['orderId']
        },
        en: {
          template: 'Payment for order {{1}} confirmed. Vendors started preparing your order.',
          params: ['orderId']
        }
      },
      delivery_update: {
        he: {
          template: 'ההזמנה {{1}} {{2}}. זמן משוער: {{3}}.',
          params: ['orderId', 'status', 'time']
        },
        en: {
          template: 'Order {{1}} is {{2}}. Estimated time: {{3}}.',
          params: ['orderId', 'status', 'time']
        }
      },
      vendor_new_order: {
        he: {
          template: 'הזמנה חדשה! {{1}} פריטים. לכניסה למערכת: {{2}}',
          params: ['itemCount', 'dashboardUrl']
        },
        en: {
          template: 'New order! {{1}} items. Access dashboard: {{2}}',
          params: ['itemCount', 'dashboardUrl']
        }
      }
    };
    
    // Delivery statuses in Hebrew/English
    this.deliveryStatuses = {
      preparing: { he: 'בהכנה', en: 'being prepared' },
      ready: { he: 'מוכנה לאיסוף', en: 'ready for pickup' },
      'out-for-delivery': { he: 'בדרך אליך', en: 'out for delivery' },
      delivered: { he: 'נמסרה', en: 'delivered' }
    };
  }

  /**
   * Send WhatsApp message with automatic SMS fallback
   */
  async sendMessage(to, message, options = {}) {
    const formattedNumber = this.formatPhoneNumber(to);
    
    try {
      // Try WhatsApp first
      const result = await this.sendWhatsApp(formattedNumber, message, options);
      return { success: true, channel: 'whatsapp', messageId: result.sid };
    } catch (whatsappError) {
      console.error('WhatsApp failed:', whatsappError.message);
      
      // Fallback to SMS
      if (options.enableSMSFallback !== false) {
        try {
          const smsResult = await this.sendSMS(formattedNumber, message);
          return { success: true, channel: 'sms', messageId: smsResult.sid };
        } catch (smsError) {
          console.error('SMS also failed:', smsError.message);
          throw new Error('Both WhatsApp and SMS failed');
        }
      }
      
      throw whatsappError;
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(to, message, options = {}) {
    const messageOptions = {
      from: this.whatsappNumber,
      to: `whatsapp:${to}`,
      body: message
    };
    
    // Add media if provided
    if (options.mediaUrl) {
      messageOptions.mediaUrl = Array.isArray(options.mediaUrl) ? options.mediaUrl : [options.mediaUrl];
    }
    
    // Add persistent action (buttons) if provided
    if (options.persistentAction) {
      messageOptions.persistentAction = options.persistentAction;
    }
    
    const result = await this.client.messages.create(messageOptions);
    console.log(`WhatsApp sent to ${to}: ${result.sid}`);
    return result;
  }

  /**
   * Send SMS message
   */
  async sendSMS(to, message) {
    const result = await this.client.messages.create({
      from: this.smsNumber,
      to: to,
      body: message
    });
    
    console.log(`SMS sent to ${to}: ${result.sid}`);
    return result;
  }

  /**
   * Send order confirmation using template
   */
  async sendOrderConfirmation(order, language = 'he') {
    // First, send WhatsApp/SMS notification
    const template = this.templates.order_confirmation[language];
    const message = this.fillTemplate(template.template, {
      1: order.customerName,
      2: order.id || order.orderId,
      3: order.total
    });
    
    const messageResult = await this.sendMessage(order.customerPhone, message);
    
    // Then send detailed email with invoice
    if (order.customerEmail) {
      await this.sendOrderEmail(order, language);
    }
    
    return messageResult;
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(payment, language = 'he') {
    const template = this.templates.payment_confirmed[language];
    const message = this.fillTemplate(template.template, {
      1: payment.orderId
    });
    
    return await this.sendMessage(payment.customerPhone, message);
  }

  /**
   * Send delivery status update
   */
  async sendDeliveryUpdate(delivery, language = 'he') {
    const template = this.templates.delivery_update[language];
    const statusText = this.deliveryStatuses[delivery.status]?.[language] || delivery.status;
    
    const message = this.fillTemplate(template.template, {
      1: delivery.orderId,
      2: statusText,
      3: delivery.estimatedTime || '30 דקות'
    });
    
    return await this.sendMessage(delivery.customerPhone, message);
  }

  /**
   * Notify vendor of new order
   */
  async notifyVendor(vendor, orderItems, language = 'he') {
    const template = this.templates.vendor_new_order[language];
    const dashboardUrl = `https://kfar.market/vendor/dashboard`;
    
    const message = this.fillTemplate(template.template, {
      1: orderItems.length,
      2: dashboardUrl
    });
    
    // Send with order details image if available
    const options = {};
    if (vendor.preferredChannel === 'whatsapp') {
      // Could generate an order summary image here
      options.enableSMSFallback = true;
    }
    
    return await this.sendMessage(vendor.phone, message, options);
  }

  /**
   * Send order email with invoice
   */
  async sendOrderEmail(order, language = 'he') {
    const isHebrew = language === 'he';
    
    const emailHtml = `
<!DOCTYPE html>
<html dir="${isHebrew ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #fef9ef; padding: 30px; text-align: center; }
    .header h1 { color: #478c0b; margin: 0; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #c23c09; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KFAR MARKETPLACE</h1>
      <p style="color: #f6af0d; margin: 10px 0 0 0;">The Whole Village, In Your Hand</p>
    </div>
    <div class="content">
      <h2>${isHebrew ? `שלום ${order.customerName}!` : `Hello ${order.customerName}!`}</h2>
      <p>${isHebrew ? 
        `תודה על ההזמנה שלך! החשבונית מצורפת למייל זה.` :
        `Thank you for your order! Your invoice is attached to this email.`}</p>
      
      <p style="background: #fef9ef; padding: 20px; border-radius: 8px;">
        <strong>${isHebrew ? 'מספר הזמנה:' : 'Order Number:'}</strong> ${order.id}<br>
        <strong>${isHebrew ? 'סה"כ:' : 'Total:'}</strong> ₪${order.total}
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://kfar.market/orders/${order.id}" class="button">
          ${isHebrew ? 'צפה בהזמנה' : 'View Order'}
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        ${isHebrew ? 
          'קיבלת הודעת WhatsApp עם פרטי ההזמנה. אם לא קיבלת, בדוק את תיקיית הספאם.' :
          'You should have received a WhatsApp message with order details. If not, check your spam folder.'}
      </p>
    </div>
  </div>
</body>
</html>`;
    
    const msg = {
      to: order.customerEmail,
      from: {
        email: process.env.FROM_EMAIL || 'orders@kfar.market',
        name: 'KFAR Marketplace'
      },
      subject: isHebrew ? 
        `אישור הזמנה ${order.id} - KFAR Marketplace` :
        `Order Confirmation ${order.id} - KFAR Marketplace`,
      html: emailHtml
    };
    
    try {
      await sgMail.send(msg);
      console.log(`Order email sent to ${order.customerEmail}`);
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  /**
   * Handle incoming WhatsApp webhook
   */
  async handleIncomingWhatsApp(messageData) {
    const { From, Body, MessageSid, ProfileName, MediaUrl0 } = messageData;
    
    console.log(`WhatsApp from ${From} (${ProfileName}): ${Body}`);
    
    // Parse message for common commands
    const lowerBody = Body.toLowerCase().trim();
    
    if (lowerBody.includes('status') || lowerBody.includes('סטטוס')) {
      // Handle order status request
      return await this.handleStatusRequest(From, Body);
    } else if (lowerBody === 'stop' || lowerBody === 'הפסק') {
      // Handle unsubscribe
      return await this.handleUnsubscribe(From);
    } else if (MediaUrl0) {
      // Handle media message (could be payment screenshot)
      return await this.handleMediaMessage(From, MediaUrl0);
    } else {
      // Route to AI assistant or support
      return await this.routeToSupport(From, Body, ProfileName);
    }
  }

  /**
   * Handle order status request
   */
  async handleStatusRequest(from, message) {
    // Extract order number from message
    const orderMatch = message.match(/\d{5,}/);
    
    if (orderMatch) {
      const orderId = orderMatch[0];
      // TODO: Fetch order status from database
      const response = `מצב הזמנה ${orderId}: בהכנה 👨‍🍳\nזמן משוער: 30 דקות`;
      
      await this.sendWhatsApp(from.replace('whatsapp:', ''), response);
      return { handled: true, action: 'status_query' };
    }
    
    const response = 'לבדיקת סטטוס הזמנה, אנא שלח את מספר ההזמנה';
    await this.sendWhatsApp(from.replace('whatsapp:', ''), response);
    return { handled: true, action: 'status_help' };
  }

  /**
   * Route to support or AI assistant
   */
  async routeToSupport(from, message, profileName) {
    // Here you could integrate with your AI assistant
    const response = `שלום ${profileName}! 👋\nתודה על פנייתך. נציג שירות יחזור אליך בקרוב.\n\nבינתיים, תוכל לבקר באתר שלנו: https://kfar.market`;
    
    await this.sendWhatsApp(from.replace('whatsapp:', ''), response);
    
    // Log for support team
    console.log(`Support request from ${profileName} (${from}): ${message}`);
    
    return { handled: true, action: 'routed_to_support' };
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(number) {
    // Remove any non-digits
    const cleaned = number.replace(/\D/g, '');
    
    // Israeli number formatting
    if (cleaned.startsWith('0')) {
      return `+972${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('972')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 9 && (cleaned.startsWith('5') || cleaned.startsWith('7'))) {
      return `+972${cleaned}`;
    }
    
    // Return with + if not already there
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  /**
   * Fill template with parameters
   */
  fillTemplate(template, params) {
    let filled = template;
    Object.entries(params).forEach(([key, value]) => {
      filled = filled.replace(`{{${key}}}`, value);
    });
    return filled;
  }

  /**
   * Handle unsubscribe request
   */
  async handleUnsubscribe(from) {
    // TODO: Update database to mark as unsubscribed
    const response = 'הוסרת מרשימת התפוצה. לחזרה שלח "START"';
    await this.sendWhatsApp(from.replace('whatsapp:', ''), response);
    return { handled: true, action: 'unsubscribed' };
  }

  /**
   * Handle media message (payment screenshots, etc.)
   */
  async handleMediaMessage(from, mediaUrl) {
    console.log(`Received media from ${from}: ${mediaUrl}`);
    
    const response = 'תודה! קיבלנו את התמונה ונבדוק אותה. נעדכן אותך בקרוב.';
    await this.sendWhatsApp(from.replace('whatsapp:', ''), response);
    
    // TODO: Process media (could be payment confirmation screenshot)
    
    return { handled: true, action: 'media_received', mediaUrl };
  }
}

module.exports = new WhatsAppBusinessService();