// Force rebuild - fixed escape sequences
import { NextResponse } from 'next/server';
import BrandedWhatsAppService from '@/services/brandedWhatsAppService';
import { db } from '@/lib/db';

// Initialize the branded WhatsApp service
const whatsappService = new BrandedWhatsAppService();

// Webhook verification (GET request from Twilio)
export async function GET(request) {
  // Twilio will send a challenge for webhook verification
  return NextResponse.json({ status: 'ok' });
}

// Handle incoming WhatsApp messages
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Extract message details
    const {
      Body: messageBody,
      From: from,
      To: to,
      MessageSid: messageSid,
      ProfileName: profileName,
      MediaUrl0: mediaUrl,
      MediaContentType0: mediaType
    } = body;
    
    console.log('📱 Incoming WhatsApp message:', {
      from,
      profileName,
      message: messageBody,
      hasMedia: !!mediaUrl
    });
    
    // Store message in database
    if (db) {
      await db.query(
        `INSERT INTO whatsapp_messages (
          message_sid, from_number, to_number, profile_name, 
          body, media_url, media_type, direction, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [messageSid, from, to, profileName, messageBody, mediaUrl, mediaType, 'inbound']
      );
    }
    
    // Process based on message content
    const command = messageBody.toLowerCase().trim();
    
    // Check if this is a new customer
    const isNewCustomer = await checkNewCustomer(from);
    if (isNewCustomer) {
      // Send branded welcome message
      await whatsappService.sendWelcomeMessage(from, detectLanguage(messageBody));
      return NextResponse.json({ success: true, action: 'welcome_sent' });
    }
    
    // Route commands
    if (command === 'menu' || command === 'תפריט') {
      await handleMenuRequest(from, profileName);
    } else if (command.startsWith('order') || command.startsWith('הזמן')) {
      await handleOrderRequest(from, messageBody, profileName);
    } else if (command === 'status' || command === 'סטטוס') {
      await handleStatusRequest(from, profileName);
    } else if (command === 'vendors' || command === 'ספקים') {
      await handleVendorsRequest(from);
    } else if (command === 'help' || command === 'עזרה') {
      await whatsappService.sendHelpMessage(from, detectLanguage(messageBody));
    } else if (command.startsWith('search') || command.startsWith('חיפוש')) {
      await handleSearchRequest(from, messageBody);
    } else {
      // Handle natural language or other messages
      await handleGeneralMessage(from, messageBody, profileName);
    }
    
    return NextResponse.json({ 
      success: true, 
      messageId: messageSid,
      processed: true 
    });
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Check if customer is new
async function checkNewCustomer(phoneNumber) {
  if (!db) return true;
  
  try {
    const result = await db.query(
      'SELECT id FROM customers WHERE phone = $1',
      [phoneNumber.replace('whatsapp:', '')]
    );
    return result.rows.length === 0;
  } catch (error) {
    console.error('Error checking customer:', error);
    return true;
  }
}

// Handle menu request
async function handleMenuRequest(from, profileName) {
  try {
    // Get categories from database
    const categories = await getProductCategories();
    
    // Format menu message with emojis
    let menuMessage = `🌿 *KFAR Marketplace Menu* 🌿\\n\\n`;
    menuMessage += `Hello ${profileName}! Here are our categories:\\n\\n`;
    
    categories.forEach((cat, index) => {
      menuMessage += `${index + 1}️⃣ *${cat.name}* ${cat.emoji}\\n`;
      menuMessage += `   ${cat.description}\\n\\n`;
    });
    
    menuMessage += `Reply with a number to see products in that category.\\n`;
    menuMessage += `Or type *SEARCH <item>* to find specific products.`;
    
    await whatsappService.sendBrandedMessage(from, menuMessage, {
      mediaUrl: 'https://kfarmarket.com/images/logos/kfar_icon_leaf_green.png'
    });
  } catch (error) {
    console.error('Menu request error:', error);
    await whatsappService.sendBrandedMessage(
      from,
      "Sorry, I couldn't load the menu right now. Please try again later."
    );
  }
}

// Handle order request
async function handleOrderRequest(from, message, profileName) {
  try {
    // Parse order from message
    const orderItems = parseOrderMessage(message);
    
    if (orderItems.length === 0) {
      await whatsappService.sendBrandedMessage(
        from,
        `To place an order, please use this format:\\n\\n*ORDER <quantity> <item>*\\n\\nExample:\\nORDER 2kg tomatoes\\nORDER 1 vegan cheese`
      );
      return;
    }
    
    // Create order in database
    const order = await createOrder({
      customerPhone: from.replace('whatsapp:', ''),
      customerName: profileName,
      items: orderItems,
      source: 'whatsapp'
    });
    
    // Send branded confirmation
    await whatsappService.sendOrderConfirmation(from, {
      orderId: order.id,
      customerName: profileName,
      total: order.total,
      items: order.items
    }, detectLanguage(message));
    
    // Notify vendors
    await notifyVendorsOfOrder(order);
    
  } catch (error) {
    console.error('Order request error:', error);
    await whatsappService.sendBrandedMessage(
      from,
      "Sorry, I couldn't process your order. Please try again or contact support."
    );
  }
}

// Handle status request
async function handleStatusRequest(from, profileName) {
  try {
    // Get latest order for customer
    const latestOrder = await getLatestOrderForCustomer(from.replace('whatsapp:', ''));
    
    if (!latestOrder) {
      await whatsappService.sendBrandedMessage(
        from,
        `Hi ${profileName}, you don't have any recent orders.\\n\\nType *MENU* to start shopping!`
      );
      return;
    }
    
    // Format status message with brand icons
    const statusIcons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '📦',
      delivering: '🚚',
      delivered: '🎉'
    };
    
    const statusMessage = whatsappService.formatBrandedMessage(
      `${statusIcons[latestOrder.status]} *Order Status*\\n\\n` +
      `Order #${latestOrder.id}\\n` +
      `Status: *${latestOrder.status.toUpperCase()}*\\n` +
      `Total: ₪${latestOrder.total}\\n\\n` +
      `Items:\\n${latestOrder.items.map(i => `• ${i.name} x${i.quantity}`).join('\\n')}\\n\\n` +
      `Track live: kfarmarket.com/orders/${latestOrder.id}`
    );
    
    await whatsappService.sendBrandedMessage(from, statusMessage);
    
  } catch (error) {
    console.error('Status request error:', error);
    await whatsappService.sendBrandedMessage(
      from,
      "Sorry, I couldn't check your order status. Please try again."
    );
  }
}

// Handle vendor list request
async function handleVendorsRequest(from) {
  try {
    const vendors = await getActiveVendors();
    
    let vendorMessage = `🌟 *Our Trusted Vendors* 🌟\\n\\n`;
    
    vendors.forEach(vendor => {
      vendorMessage += `🏪 *${vendor.name}*\\n`;
      vendorMessage += `📍 ${vendor.location}\\n`;
      vendorMessage += `⭐ ${vendor.rating}/5 (${vendor.reviewCount} reviews)\\n`;
      vendorMessage += `🌿 ${vendor.specialties.join(', ')}\\n\\n`;
    });
    
    vendorMessage += `Visit kfarmarket.com/vendors for full profiles`;
    
    await whatsappService.sendBrandedMessage(from, vendorMessage);
    
  } catch (error) {
    console.error('Vendors request error:', error);
    await whatsappService.sendBrandedMessage(
      from,
      "Sorry, I couldn't load vendor information. Please try again."
    );
  }
}

// Handle search request
async function handleSearchRequest(from, message) {
  try {
    const searchTerm = message.replace(/^(search|חיפוש)\s+/i, '').trim();
    
    if (!searchTerm) {
      await whatsappService.sendBrandedMessage(
        from,
        "Please specify what you're looking for.\\n\\nExample: *SEARCH tomatoes*"
      );
      return;
    }
    
    // Search products
    const products = await searchProducts(searchTerm);
    
    if (products.length === 0) {
      await whatsappService.sendBrandedMessage(
        from,
        `No products found for "${searchTerm}".\\n\\nTry browsing our *MENU* or search for something else.`
      );
      return;
    }
    
    // Format search results
    let resultsMessage = `🔍 *Search Results for "${searchTerm}"*\\n\\n`;
    
    products.slice(0, 5).forEach((product, index) => {
      resultsMessage += `${index + 1}. *${product.name}*\\n`;
      resultsMessage += `   💰 ₪${product.price}\\n`;
      resultsMessage += `   🏪 ${product.vendorName}\\n`;
      resultsMessage += `   📝 ${product.description.substring(0, 50)}...\\n\\n`;
    });
    
    resultsMessage += `To order, type: *ORDER <quantity> ${products[0].name}*`;
    
    await whatsappService.sendBrandedMessage(from, resultsMessage);
    
  } catch (error) {
    console.error('Search error:', error);
    await whatsappService.sendBrandedMessage(
      from,
      'Sorry, search is temporarily unavailable. Please try again later.'
    );
  }
}

// Handle general messages with AI
async function handleGeneralMessage(from, message, profileName) {
  try {
    // Use AI to understand intent
    const intent = await analyzeMessageIntent(message);
    
    switch (intent.type) {
      case 'greeting':
        await whatsappService.sendBrandedMessage(
          from,
          `Hello ${profileName}! 👋\\n\\nWelcome to KFAR Marketplace.\\n\\nHow can I help you today?\\n\\n• Type *MENU* to browse products\\n• Type *HELP* for assistance`
        );
        break;
        
      case 'product_inquiry':
        await handleSearchRequest(from, `search ${intent.product}`);
        break;
        
      case 'order_intent':
        await whatsappService.sendBrandedMessage(
          from,
          `I'd be happy to help you order!\\n\\nPlease use this format:\\n*ORDER <quantity> <item>*\\n\\nOr type *MENU* to browse our products first.`
        );
        break;
        
      default:
        await whatsappService.sendBrandedMessage(
          from,
          `I'm not sure I understood that.\\n\\nHere's what I can help with:\\n\\n• *MENU* - Browse products\\n• *ORDER* - Place an order\\n• *STATUS* - Check order status\\n• *HELP* - Get assistance`
        );
    }
  } catch (error) {
    console.error('General message error:', error);
    await whatsappService.sendHelpMessage(from, detectLanguage(message));
  }
}

// Helper functions
function detectLanguage(text) {
  const hebrewPattern = /[\u0590-\u05FF]/;
  return hebrewPattern.test(text) ? 'he' : 'en';
}

function parseOrderMessage(message) {
  // Simple order parsing - can be enhanced with NLP
  const orderPattern = /(?:order|הזמן)\s+(\d+(?:\.\d+)?)\s*(?:kg|ק"ג|קילו)?\s+(.+)/i;
  const match = message.match(orderPattern);
  
  if (match) {
    return [{
      quantity: parseFloat(match[1]),
      item: match[2].trim()
    }];
  }
  
  return [];
}

async function getProductCategories() {
  // Mock data - replace with database query
  return [
    { name: 'Fresh Produce', emoji: '🥬', description: 'Organic fruits & vegetables' },
    { name: 'Prepared Foods', emoji: '🥘', description: 'Ready meals & deli items' },
    { name: 'Bakery', emoji: '🍞', description: 'Fresh bread & pastries' },
    { name: 'Pantry', emoji: '🥫', description: 'Grains, beans & staples' },
    { name: 'Special Items', emoji: '✨', description: 'Unique vegan products' }
  ];
}

async function searchProducts(searchTerm) {
  // Mock search - replace with actual database search
  return [
    {
      id: 1,
      name: 'Organic Tomatoes',
      price: 15.90,
      vendorName: 'Garden of Light',
      description: 'Fresh, locally grown organic tomatoes perfect for salads'
    }
  ];
}

async function getActiveVendors() {
  // Mock vendors - replace with database query
  return [
    {
      name: 'Garden of Light',
      location: 'Village of Peace, Dimona',
      rating: 4.8,
      reviewCount: 156,
      specialties: ['Organic Produce', 'Fresh Herbs']
    },
    {
      name: 'Teva Deli',
      location: 'Village of Peace, Dimona',
      rating: 4.9,
      reviewCount: 203,
      specialties: ['Vegan Deli', 'Plant-Based Meats']
    }
  ];
}

async function createOrder(orderData) {
  // Mock order creation - implement actual logic
  return {
    id: 'ORD-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    ...orderData,
    total: 156.50,
    status: 'pending'
  };
}

async function getLatestOrderForCustomer(phone) {
  // Mock order lookup - implement actual logic
  return null;
}

async function notifyVendorsOfOrder(order) {
  // Implement vendor notification logic
  console.log('Notifying vendors of order:', order.id);
}

async function analyzeMessageIntent(message) {
  // Simple intent detection - can be enhanced with AI
  if (message.match(/^(hi|hello|hey|shalom|שלום)/i)) {
    return { type: 'greeting' };
  }
  
  if (message.match(/(want|need|looking for|where|find)/i)) {
    return { type: 'product_inquiry', product: message };
  }
  
  if (message.match(/(order|buy|purchase|get)/i)) {
    return { type: 'order_intent' };
  }
  
  return { type: 'unknown' };
}