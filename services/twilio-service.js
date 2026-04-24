const twilio = require('twilio');

class TwilioService {
  constructor() {
    // Initialize Twilio client
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = twilio(this.accountSid, this.authToken);
    
    // Your phone numbers
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '+972535669174';
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox for testing
  }

  // Send SMS
  async sendSMS(to, message) {
    try {
      const formattedNumber = this.formatIsraeliNumber(to);
      
      const result = await this.client.messages.create({
        from: this.phoneNumber,
        to: formattedNumber,
        body: message
      });
      
      console.log(`SMS sent successfully: ${result.sid}`);
      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // Send WhatsApp message
  async sendWhatsApp(to, message) {
    try {
      const formattedNumber = this.formatIsraeliNumber(to);
      
      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${formattedNumber}`,
        body: message
      });
      
      console.log(`WhatsApp message sent successfully: ${result.sid}`);
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      // Fallback to SMS if WhatsApp fails
      console.log('Falling back to SMS...');
      return await this.sendSMS(to, message);
    }
  }

  // Send order confirmation
  async sendOrderConfirmation(order) {
    const message = `שלום ${order.customerName}! 
ההזמנה שלך #${order.id} התקבלה בהצלחה ✅
סה"כ: ₪${order.total}
נעדכן אותך ברגע שהספקים יתחילו להכין את המוצרים.
תודה שבחרת ב-KFAR! 🌱`;

    // Try WhatsApp first, fallback to SMS
    return await this.sendWhatsApp(order.phone, message);
  }

  // Send payment confirmation
  async sendPaymentConfirmation(payment) {
    const message = `התשלום שלך התקבל! 💰
סכום: ₪${payment.amount}
הזמנה: #${payment.orderId}
הספקים קיבלו הודעה והחלו להכין את ההזמנה שלך.`;

    return await this.sendWhatsApp(payment.customerPhone, message);
  }

  // Notify vendor of new order
  async notifyVendor(vendor, orderItems) {
    const itemsList = orderItems.map(item => `- ${item.name} (${item.quantity})`).join('\n');
    
    const message = `הזמנה חדשה! 📦
${orderItems.length} פריטים:
${itemsList}

לצפייה בפרטים המלאים היכנס למערכת.`;

    return await this.sendWhatsApp(vendor.phone, message);
  }

  // Format Israeli phone numbers
  formatIsraeliNumber(number) {
    // Remove any non-digits
    const cleaned = number.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Local format: 0541234567 -> +972541234567
      return `+972${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('972')) {
      // Already has country code
      return `+${cleaned}`;
    } else if (cleaned.length === 9) {
      // Just the number: 541234567 -> +972541234567
      return `+972${cleaned}`;
    }
    
    // Return as-is if format is unclear
    return `+${cleaned}`;
  }

  // Handle incoming SMS webhook
  async handleIncomingSMS(messageData) {
    const { From, Body, MessageSid } = messageData;
    
    console.log(`Received SMS from ${From}: ${Body}`);
    
    // Here you can add logic to:
    // - Parse order status requests
    // - Handle customer support queries
    // - Route to AI assistant
    
    // For now, just acknowledge
    return {
      response: 'תודה על פנייתך! נחזור אליך בהקדם.'
    };
  }
}

module.exports = new TwilioService();