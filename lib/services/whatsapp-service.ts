// WhatsApp Notification Service for KFAR Marketplace
// This service handles order notifications to vendors and customers

interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'order' | 'status' | 'reminder';
}

interface OrderNotification {
  orderId: string;
  orderNumber: string;
  vendorPhone: string;
  customerPhone: string;
  vendorName: string;
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  pickupDate: string;
  pickupTime: string;
  collectionPoint: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  
  private constructor() {}
  
  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Send order notification to vendor
  async notifyVendorNewOrder(order: OrderNotification): Promise<boolean> {
    const message = this.formatVendorOrderMessage(order);
    
    // For now, we'll use WhatsApp URL scheme
    // In production, integrate with Twilio or WhatsApp Business API
    const whatsappUrl = this.generateWhatsAppUrl(order.vendorPhone, message);
    
    console.log('Vendor notification URL:', whatsappUrl);
    
    // In production, send via API
    // For demo, return true
    return true;
  }

  // Send order confirmation to customer
  async notifyCustomerOrderConfirmed(order: OrderNotification): Promise<boolean> {
    const message = this.formatCustomerConfirmationMessage(order);
    const whatsappUrl = this.generateWhatsAppUrl(order.customerPhone, message);
    
    console.log('Customer notification URL:', whatsappUrl);
    
    return true;
  }

  // Send status update to customer
  async notifyCustomerStatusUpdate(
    customerPhone: string,
    orderNumber: string,
    status: string,
    vendorName: string
  ): Promise<boolean> {
    const message = this.formatStatusUpdateMessage(orderNumber, status, vendorName);
    const whatsappUrl = this.generateWhatsAppUrl(customerPhone, message);
    
    console.log('Status update URL:', whatsappUrl);
    
    return true;
  }

  // Format vendor order notification
  private formatVendorOrderMessage(order: OrderNotification): string {
    const itemsList = order.items
      .map(item => `• ${item.quantity}x ${item.name}`)
      .join('\\n');
    
    return `🛍️ *New Order Alert!*

Order: ${order.orderNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}

*Items Ordered:*
${itemsList}

*Total: ₪${order.total}*

📅 Pickup: ${order.pickupDate} at ${order.pickupTime}
📍 Location: ${order.collectionPoint}

Please accept or decline this order in your vendor dashboard.`;
  }

  // Format customer confirmation message
  private formatCustomerConfirmationMessage(order: OrderNotification): string {
    const itemsList = order.items
      .map(item => `• ${item.quantity}x ${item.name}`)
      .join('\\n');
    
    return `✅ *Order Confirmed!*

Thank you for your order from ${order.vendorName}!

Order #: ${order.orderNumber}

*Your Items:*
${itemsList}

*Total: ₪${order.total}*

📅 Pickup: ${order.pickupDate} at ${order.pickupTime}
📍 Location: ${order.collectionPoint}

We'll notify you when your order is ready for pickup.`;
  }

  // Format status update message
  private formatStatusUpdateMessage(
    orderNumber: string,
    status: string,
    vendorName: string
  ): string {
    const statusMessages: Record<string, string> = {
      accepted: `✅ Your order #${orderNumber} from ${vendorName} has been accepted!`,
      preparing: `👨‍🍳 ${vendorName} is now preparing your order #${orderNumber}`,
      ready: `🎉 Your order #${orderNumber} is ready for pickup at ${vendorName}!`,
      completed: `✨ Thank you for collecting your order #${orderNumber} from ${vendorName}!`
    };
    
    return statusMessages[status] || `Order #${orderNumber} status: ${status}`;
  }

  // Generate WhatsApp URL for click-to-chat
  private generateWhatsAppUrl(phone: string, message: string): string {
    // Remove any non-digit characters and ensure proper format
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  // Send bulk notifications (for marketing)
  async sendBulkNotification(
    phones: string[],
    message: string,
    delay: number = 1000
  ): Promise<void> {
    // In production, use WhatsApp Business API with proper rate limiting
    for (const phone of phones) {
      await this.sendMessage({ to: phone, message, type: 'reminder' });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Generic send message function
  private async sendMessage(msg: WhatsAppMessage): Promise<boolean> {
    // In production, integrate with Twilio or WhatsApp Business API
    console.log('Sending WhatsApp message:', msg);
    
    // For now, just log and return success
    return true;
  }
}

// Export singleton instance
export const whatsAppService = WhatsAppService.getInstance();