// Test webhook route for WhatsApp - bypasses signature verification
import { NextResponse } from 'next/server';

// Simple handler for testing
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    let data;
    
    // Handle different content types
    if (contentType?.includes('application/json')) {
      data = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData);
    } else {
      const text = await request.text();
      // Try to parse URL encoded data manually
      data = {};
      text.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          data[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }
    
    console.log('🌿 WhatsApp Test Webhook Received:', {
      contentType,
      data,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // Extract message details with multiple fallbacks
    const messageBody = (data.Body || data.body || 'menu').toLowerCase();
    const from = data.From || data.from || 'whatsapp:+1234567890';
    const profileName = data.ProfileName || data.profileName || 'Customer';
    
    console.log('📱 Processing message:', { messageBody, from, profileName });
    
    // Create response based on command
    let responseMessage = '';
    
    if (messageBody === 'menu' || messageBody === 'תפריט') {
      responseMessage = `🌿 *KFAR Marketplace Menu* 🌿

Welcome ${profileName}! Fresh from Village of Peace:

🥬 *Fresh Produce*
• Organic Tomatoes - ₪15/kg
• Fresh Cabbage - ₪12/head
• Local Carrots - ₪18/kg

🥘 *Vegan Deli* (Teva Deli)
• Vegan Schnitzel - ₪45
• Tofu Shawarma - ₪38
• Seitan Burgers - ₪42/pack

🍞 *Bakery* (Coming Soon)
• Fresh Pita - ₪8/pack
• Whole Wheat Bread - ₪15

Type *ORDER <item>* to purchase
Type *VENDORS* to see all vendors
Type *HELP* for assistance`;
    } else if (messageBody === 'vendors' || messageBody === 'ספקים') {
      responseMessage = `🏪 *Our KFAR Vendors* 🏪

🌿 *Garden of Light*
⭐ 4.8/5 (156 reviews)
📍 Organic produce specialist

🥘 *Teva Deli*
⭐ 4.9/5 (203 reviews)
📍 Plant-based meat alternatives

🌺 *Queen's Cuisine*
⭐ 4.7/5 (89 reviews)
📍 Gourmet vegan meals

🛒 *People Store*
⭐ 4.6/5 (124 reviews)
📍 Bulk goods & pantry items

🎨 *VOP Shop*
⭐ 5.0/5 (67 reviews)
📍 Community crafts & wellness

Visit kfarmarket.com for full details`;
    } else if (messageBody.startsWith('order')) {
      const item = messageBody.replace('order', '').trim();
      responseMessage = `📦 *Order Received!*

Thank you ${profileName}!

Your order for "${item || 'your items'}" has been received.

Order #: KFR-${Date.now().toString(36).toUpperCase()}
Status: Processing
Estimated delivery: 2-4 hours

We'll notify you when ready!

Track at: kfarmarket.com/orders`;
    } else if (messageBody === 'help' || messageBody === 'עזרה') {
      responseMessage = `💚 *KFAR Help Center* 💚

Available commands:
• *MENU* - Browse products
• *VENDORS* - List vendors
• *ORDER <item>* - Place order
• *STATUS* - Check order status

Contact support:
📞 Call: +1 814 778 3568
💬 WhatsApp: Available 9am-6pm
📧 Email: support@kfarmarket.com

🌍 Village of Peace, Dimona`;
    } else {
      responseMessage = `Hello ${profileName}! 👋

I can help you with:
• Type *MENU* to browse
• Type *VENDORS* to see shops
• Type *HELP* for assistance

🌿 KFAR Marketplace
Village of Peace, Dimona`;
    }
    
    // Return TwiML response for Twilio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${responseMessage}</Message>
</Response>`;
    
    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
    
  } catch (error) {
    console.error('❌ WhatsApp test webhook error:', error);
    
    // Return empty TwiML on error to prevent Twilio retries
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'kfar-whatsapp-test',
    message: 'Test webhook is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/api/webhooks/whatsapp-test',
      method: 'POST',
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
    },
    commands: ['menu', 'vendors', 'order <item>', 'help', 'status'],
  });
}