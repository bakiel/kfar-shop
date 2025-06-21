// Twilio Service for KFAR Marketplace
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export class TwilioService {
  // Send order confirmation SMS
  static async sendOrderConfirmation(phoneNumber: string, orderDetails: any) {
    try {
      const message = await client.messages.create({
        body: `🌱 KFAR Marketplace Order Confirmed!\n\nOrder #${orderDetails.id}\nTotal: ₪${orderDetails.total}\n\nThank you for supporting local vendors!`,
        from: twilioPhone,
        to: phoneNumber
      });
      
      console.log('Order confirmation sent:', message.sid);
      return message;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw error;
    }
  }

  // Send vendor notification
  static async notifyVendor(vendorPhone: string, orderItem: any) {
    try {
      const message = await client.messages.create({
        body: `📦 New Order!\n\nProduct: ${orderItem.productName}\nQuantity: ${orderItem.quantity}\nCustomer: ${orderItem.customerName}\n\nPlease prepare for pickup/delivery.`,
        from: twilioPhone,
        to: vendorPhone
      });
      
      return message;
    } catch (error) {
      console.error('Vendor notification error:', error);
      throw error;
    }
  }

  // Send delivery update
  static async sendDeliveryUpdate(phoneNumber: string, status: string, orderNumber: string) {
    const statusMessages: Record<string, string> = {
      'preparing': '👨‍🍳 Your order is being prepared',
      'ready': '✅ Your order is ready for pickup',
      'out-for-delivery': '🚚 Your order is out for delivery',
      'delivered': '🎉 Your order has been delivered'
    };

    try {
      const message = await client.messages.create({
        body: `KFAR Order Update #${orderNumber}\n\n${statusMessages[status] || status}`,
        from: twilioPhone,
        to: phoneNumber
      });
      
      return message;
    } catch (error) {
      console.error('Delivery update error:', error);
      throw error;
    }
  }

  // Send promotional message (with consent check)
  static async sendPromotion(phoneNumbers: string[], promoText: string) {
    const results = [];
    
    for (const phone of phoneNumbers) {
      try {
        const message = await client.messages.create({
          body: `🌟 KFAR Special Offer!\n\n${promoText}\n\nReply STOP to unsubscribe.`,
          from: twilioPhone,
          to: phone
        });
        
        results.push({ phone, status: 'sent', sid: message.sid });
      } catch (error) {
        results.push({ phone, status: 'failed', error: error.message });
      }
    }
    
    return results;
  }

  // Voice call for support
  static async initiateVoiceCall(phoneNumber: string, agentPhone: string) {
    try {
      const call = await client.calls.create({
        url: 'http://demo.twilio.com/docs/voice.xml', // You'll need to create a TwiML endpoint
        to: phoneNumber,
        from: twilioPhone
      });
      
      return call;
    } catch (error) {
      console.error('Voice call error:', error);
      throw error;
    }
  }

  // WhatsApp integration
  static async sendWhatsAppMessage(phoneNumber: string, message: string) {
    try {
      const whatsappMessage = await client.messages.create({
        body: message,
        from: 'whatsapp:+14155238886', // Twilio Sandbox number
        to: `whatsapp:${phoneNumber}`
      });
      
      return whatsappMessage;
    } catch (error) {
      console.error('WhatsApp error:', error);
      throw error;
    }
  }
}

export default TwilioService;
