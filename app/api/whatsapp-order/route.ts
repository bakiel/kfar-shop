import { NextRequest, NextResponse } from 'next/server';

// Generate order invoice text for WhatsApp
function generateInvoiceText(orderData: any) {
  const { orderNumber, customer, items, totals, deliveryMethod, paymentMethod } = orderData;
  
  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : deliveryMethod === 'local' ? 15 : 25;
  const tax = (subtotal + deliveryFee) * 0.17;
  const total = subtotal + deliveryFee + tax;
  
  // Format items list
  const itemsList = items.map((item: any) => 
    `• ${item.quantity}x ${item.name} - ₪${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');
  
  // Payment instructions based on method
  const paymentInstructions = {
    braysheet: `💰 *Braysheet Payment*\nTransfer ${total.toFixed(2)} Braysheet tokens to:\nAccount: KFAR-MARKETPLACE\nReference: ${orderNumber}`,
    bank: `🏦 *Bank Transfer*\nBank: Bank Hapoalim\nAccount: 12-345-678901\nName: KFAR Marketplace Ltd\nAmount: ₪${total.toFixed(2)}\nReference: ${orderNumber}`,
    qr: `📱 *QR Payment*\nScan this code with your banking app:\nhttps://kfar.market/pay/${orderNumber}`,
    card: `💳 *Credit Card*\nPayment link: https://kfar.market/pay/${orderNumber}\nAmount: ₪${total.toFixed(2)}`
  };
  
  const deliveryInfo = {
    pickup: '📍 Pickup: Village of Peace Community Center\nAddress: Kfar Hashalom, Dimona\nHours: Sun-Thu 9:00-18:00, Fri 9:00-14:00',
    local: '🚚 Local Delivery: Within 1-2 business days\nTo your address in Dimona',
    standard: '📦 Standard Shipping: 3-5 business days\nTo your address anywhere in Israel'
  };
  
  // Build the complete message
  const message = `🛍️ *KFAR MARKETPLACE*
*Order Confirmation & Invoice*

═══════════════════
📋 *Order Details*
═══════════════════
Order #: ${orderNumber}
Date: ${new Date().toLocaleDateString('he-IL')}
Customer: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email}

═══════════════════
🛒 *Items Ordered*
═══════════════════
${itemsList}

─────────────────
Subtotal: ₪${subtotal.toFixed(2)}
Delivery: ₪${deliveryFee.toFixed(2)}
VAT (17%): ₪${tax.toFixed(2)}
─────────────────
*TOTAL: ₪${total.toFixed(2)}*

═══════════════════
💳 *Payment Instructions*
═══════════════════
${paymentInstructions[paymentMethod as keyof typeof paymentInstructions]}

═══════════════════
📦 *Delivery Information*
═══════════════════
${deliveryInfo[deliveryMethod as keyof typeof deliveryInfo]}

═══════════════════
📞 *Need Help?*
═══════════════════
WhatsApp: 052-KFAR-MKT
Email: support@kfar.market
Office: 08-655-4321

Thank you for supporting Village of Peace businesses!
יה חי! HalleluYah! 🌱

*Save this message as your invoice receipt*`;
  
  return { message, total, orderNumber };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both formats - direct orderDetails or nested structure
    const orderData = body.orderDetails || body;
    
    // More flexible validation
    const hasCustomerData = orderData.customer || (orderData.phone && (orderData.orderId || orderData.orderNumber));
    const hasItems = orderData.items && orderData.items.length > 0;
    
    if (!hasCustomerData || !hasItems) {
      return NextResponse.json(
        { error: 'Missing required order data (customer and items required)' },
        { status: 400 }
      );
    }
    
    // Normalize customer data
    if (!orderData.customer && orderData.phone) {
      orderData.customer = {
        name: orderData.customerName || 'Customer',
        phone: orderData.phone,
        email: orderData.email || 'customer@kfar.market'
      };
    }
    
    // Generate invoice text
    const { message, total, orderNumber } = generateInvoiceText(orderData);
    
    // Clean phone number (remove spaces, dashes, etc.)
    let phoneNumber = orderData.customer.phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '972' + phoneNumber.substring(1); // Israeli number
    }
    
    // Create WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Also prepare a business WhatsApp URL for vendor notification
    const vendorMessage = `🆕 *New Order Alert!*\n\nOrder #${orderNumber}\nCustomer: ${orderData.customer.name}\nTotal: ₪${total.toFixed(2)}\n\nPlease check your vendor dashboard for details.`;
    const vendorWhatsappUrl = `https://wa.me/972521234567?text=${encodeURIComponent(vendorMessage)}`; // Replace with actual vendor number
    
    return NextResponse.json({
      success: true,
      orderNumber,
      total,
      customerWhatsappUrl: whatsappUrl,
      vendorWhatsappUrl,
      message: 'WhatsApp invoice ready to send'
    });
    
  } catch (error) {
    console.error('WhatsApp order error:', error);
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp invoice' },
      { status: 500 }
    );
  }
}