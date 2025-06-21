const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');
const path = require('path');

class BrandedWhatsAppService {
  constructor() {
    // Initialize Twilio client with new WhatsApp Business number
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = twilio(this.accountSid, this.authToken);
    
    // WhatsApp Business Configuration
    this.whatsappNumber = 'whatsapp:+18147783568'; // Your WhatsApp Business number
    this.smsNumber = '+18147783568'; // Same number for SMS
    this.businessName = 'Kfar Marketplace';
    
    // Brand Assets
    this.brandAssets = {
      primaryLogo: 'https://kfarmarket.com/images/logos/kfar_logo_primary_horizontal.png',
      leafIcon: 'https://kfarmarket.com/images/logos/kfar_icon_leaf_green.png',
      africaIcon: 'https://kfarmarket.com/images/logos/kfar_icon_africa_gold.png',
      premiumLogo: 'https://kfarmarket.com/images/logos/kfar_logo_gold_premium.png',
      whiteOnGreen: 'https://kfarmarket.com/images/logos/kfar_logo_white_on_green.png'
    };
    
    // Brand Emojis and Icons
    this.brandIcons = {
      leaf: '🌿',
      africa: '🌍',
      heart: '💚',
      star: '⭐',
      check: '✅',
      cart: '🛒',
      package: '📦',
      delivery: '🚚',
      payment: '💳',
      celebration: '🎉'
    };
    
    // Initialize SendGrid for email backup
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  // Format message with KFAR branding
  formatBrandedMessage(template, params = {}, includeHeader = true) {
    let message = '';
    
    // Add branded header
    if (includeHeader) {
      message += `${this.brandIcons.leaf} *KFAR Marketplace* ${this.brandIcons.leaf}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }
    
    // Process template
    message += template;
    
    // Add branded footer
    message += `\n\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${this.brandIcons.africa} *Village of Peace, Dimona* ${this.brandIcons.africa}\n`;
    message += `_Authentic Vegan Marketplace_`;
    
    return message;
  }

  // Branded message templates
  getBrandedTemplates() {
    return {
      welcome: {
        en: this.formatBrandedMessage(
          `${this.brandIcons.heart} *Welcome to KFAR Marketplace!*\n\n` +
          `Thank you for joining our community of authentic vegan vendors and conscious consumers.\n\n` +
          `${this.brandIcons.check} *What you can do:*\n` +
          `• Browse our vegan products\n` +
          `• Order from local vendors\n` +
          `• Track your deliveries\n` +
          `• Connect with our community\n\n` +
          `Reply with:\n` +
          `*MENU* - View product categories\n` +
          `*VENDORS* - See our vendors\n` +
          `*HELP* - Get assistance`
        ),
        he: this.formatBrandedMessage(
          `${this.brandIcons.heart} *ברוכים הבאים ל-KFAR Marketplace!*\n\n` +
          `תודה שהצטרפתם לקהילת הספקים הטבעוניים והצרכנים המודעים שלנו.\n\n` +
          `${this.brandIcons.check} *מה אפשר לעשות:*\n` +
          `• לעיין במוצרים הטבעוניים שלנו\n` +
          `• להזמין מספקים מקומיים\n` +
          `• לעקוב אחר המשלוחים\n` +
          `• להתחבר לקהילה שלנו\n\n` +
          `השיבו עם:\n` +
          `*תפריט* - הצגת קטגוריות מוצרים\n` +
          `*ספקים* - הצגת הספקים שלנו\n` +
          `*עזרה* - קבלת סיוע`
        )
      },
      
      orderConfirmation: {
        en: (orderId, customerName, total, items) => this.formatBrandedMessage(
          `${this.brandIcons.check} *Order Confirmed!*\n\n` +
          `Hello ${customerName},\n\n` +
          `Your order #${orderId} has been received.\n\n` +
          `${this.brandIcons.cart} *Order Summary:*\n` +
          `${items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}\n\n` +
          `${this.brandIcons.payment} *Total: ₪${total}*\n\n` +
          `We'll notify you when vendors start preparing your order.\n\n` +
          `Track your order: kfarmarket.com/orders/${orderId}`
        ),
        he: (orderId, customerName, total, items) => this.formatBrandedMessage(
          `${this.brandIcons.check} *ההזמנה אושרה!*\n\n` +
          `שלום ${customerName},\n\n` +
          `הזמנה מספר ${orderId} התקבלה.\n\n` +
          `${this.brandIcons.cart} *סיכום הזמנה:*\n` +
          `${items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}\n\n` +
          `${this.brandIcons.payment} *סה"כ: ₪${total}*\n\n` +
          `נעדכן אותך כשהספקים יתחילו להכין את ההזמנה.\n\n` +
          `מעקב הזמנה: kfarmarket.com/orders/${orderId}`
        )
      },
      
      vendorNotification: {
        en: (vendorName, orderId, items) => this.formatBrandedMessage(
          `${this.brandIcons.star} *New Order Alert!*\n\n` +
          `Hello ${vendorName},\n\n` +
          `You have a new order #${orderId}:\n\n` +
          `${this.brandIcons.package} *Items to prepare:*\n` +
          `${items.map(item => `• ${item.name} x${item.quantity} - ₪${item.price * item.quantity}`).join('\n')}\n\n` +
          `Please confirm preparation time.\n\n` +
          `Vendor Dashboard: kfarmarket.com/vendor`
        ),
        he: (vendorName, orderId, items) => this.formatBrandedMessage(
          `${this.brandIcons.star} *התראת הזמנה חדשה!*\n\n` +
          `שלום ${vendorName},\n\n` +
          `יש לך הזמנה חדשה #${orderId}:\n\n` +
          `${this.brandIcons.package} *פריטים להכנה:*\n` +
          `${items.map(item => `• ${item.name} x${item.quantity} - ₪${item.price * item.quantity}`).join('\n')}\n\n` +
          `אנא אשרו זמן הכנה.\n\n` +
          `לוח בקרה לספקים: kfarmarket.com/vendor`
        )
      },
      
      deliveryUpdate: {
        en: (orderId, status, estimatedTime) => this.formatBrandedMessage(
          `${this.brandIcons.delivery} *Delivery Update*\n\n` +
          `Order #${orderId} is ${status}.\n` +
          `Estimated delivery: ${estimatedTime}\n\n` +
          `Track live: kfarmarket.com/track/${orderId}`
        ),
        he: (orderId, status, estimatedTime) => this.formatBrandedMessage(
          `${this.brandIcons.delivery} *עדכון משלוח*\n\n` +
          `הזמנה #${orderId} ${status}.\n` +
          `זמן משלוח משוער: ${estimatedTime}\n\n` +
          `מעקב חי: kfarmarket.com/track/${orderId}`
        )
      },
      
      productMenu: {
        en: () => this.formatBrandedMessage(
          `${this.brandIcons.cart} *Product Categories*\n\n` +
          `1️⃣ *Fresh Produce* 🥬\n` +
          `   Organic fruits & vegetables\n\n` +
          `2️⃣ *Prepared Foods* 🥘\n` +
          `   Ready meals & deli items\n\n` +
          `3️⃣ *Bakery* 🍞\n` +
          `   Fresh bread & pastries\n\n` +
          `4️⃣ *Pantry* 🥫\n` +
          `   Grains, beans & staples\n\n` +
          `5️⃣ *Special Items* ✨\n` +
          `   Unique vegan products\n\n` +
          `Reply with category number or\n` +
          `*SEARCH <item>* to find products`
        ),
        he: () => this.formatBrandedMessage(
          `${this.brandIcons.cart} *קטגוריות מוצרים*\n\n` +
          `1️⃣ *תוצרת טרייה* 🥬\n` +
          `   פירות וירקות אורגניים\n\n` +
          `2️⃣ *מזון מוכן* 🥘\n` +
          `   ארוחות מוכנות ומעדנייה\n\n` +
          `3️⃣ *מאפייה* 🍞\n` +
          `   לחם ומאפים טריים\n\n` +
          `4️⃣ *מזווה* 🥫\n` +
          `   דגנים, קטניות ומצרכי יסוד\n\n` +
          `5️⃣ *פריטים מיוחדים* ✨\n` +
          `   מוצרים טבעוניים ייחודיים\n\n` +
          `השיבו עם מספר קטגוריה או\n` +
          `*חיפוש <מוצר>* למציאת מוצרים`
        )
      }
    };
  }

  // Send branded WhatsApp message with media
  async sendBrandedMessage(to, message, options = {}) {
    try {
      const messageOptions = {
        from: this.whatsappNumber,
        to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
        body: message
      };
      
      // Add media if specified
      if (options.mediaUrl) {
        messageOptions.mediaUrl = [options.mediaUrl];
      }
      
      // Send via WhatsApp
      const result = await this.client.messages.create(messageOptions);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
      
    } catch (error) {
      console.error('WhatsApp send error:', error);
      
      // Fallback to SMS
      if (options.fallbackToSms !== false) {
        return this.sendSms(to, message);
      }
      
      throw error;
    }
  }

  // Send SMS with branding
  async sendSms(to, message) {
    try {
      const smsMessage = message.replace(/\*/g, '').substring(0, 160); // Remove markdown, limit length
      
      const result = await this.client.messages.create({
        from: this.smsNumber,
        to: to.replace('whatsapp:', ''),
        body: `KFAR: ${smsMessage}`
      });
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        fallback: true
      };
    } catch (error) {
      console.error('SMS send error:', error);
      throw error;
    }
  }

  // Send welcome message with logo
  async sendWelcomeMessage(to, language = 'en') {
    const templates = this.getBrandedTemplates();
    const welcomeMessage = templates.welcome[language];
    
    // Send with KFAR logo
    return this.sendBrandedMessage(to, welcomeMessage, {
      mediaUrl: this.brandAssets.primaryLogo
    });
  }

  // Send order confirmation with product images
  async sendOrderConfirmation(to, orderData, language = 'en') {
    const templates = this.getBrandedTemplates();
    const message = templates.orderConfirmation[language](
      orderData.orderId,
      orderData.customerName,
      orderData.total,
      orderData.items
    );
    
    return this.sendBrandedMessage(to, message);
  }

  // Interactive product catalog
  async sendProductCatalog(to, language = 'en') {
    const templates = this.getBrandedTemplates();
    const catalogMessage = templates.productMenu[language]();
    
    // Send with brand icon
    return this.sendBrandedMessage(to, catalogMessage, {
      mediaUrl: this.brandAssets.leafIcon
    });
  }

  // Process incoming WhatsApp messages
  async processIncomingMessage(from, body, messageData = {}) {
    const language = this.detectLanguage(body);
    const command = body.toLowerCase().trim();
    
    // Command routing
    switch (command) {
      case 'menu':
      case 'תפריט':
        return this.sendProductCatalog(from, language);
        
      case 'help':
      case 'עזרה':
        return this.sendHelpMessage(from, language);
        
      case 'vendors':
      case 'ספקים':
        return this.sendVendorList(from, language);
        
      default:
        // Check for order commands
        if (command.startsWith('order') || command.startsWith('הזמן')) {
          return this.processOrderCommand(from, body, language);
        }
        
        // Check for search commands
        if (command.startsWith('search') || command.startsWith('חיפוש')) {
          return this.processSearchCommand(from, body, language);
        }
        
        // Default response
        return this.sendDefaultResponse(from, language);
    }
  }

  // Language detection
  detectLanguage(text) {
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text) ? 'he' : 'en';
  }

  // Send help message
  async sendHelpMessage(to, language = 'en') {
    const helpText = {
      en: this.formatBrandedMessage(
        `${this.brandIcons.heart} *How can we help?*\n\n` +
        `📱 *Commands:*\n` +
        `• MENU - View products\n` +
        `• ORDER <items> - Place order\n` +
        `• STATUS - Check order status\n` +
        `• VENDORS - List vendors\n` +
        `• HELP - This message\n\n` +
        `💬 *Contact Support:*\n` +
        `• Call: +972-8-123-4567\n` +
        `• Email: support@kfarmarket.com\n` +
        `• Hours: Sun-Thu 8:00-18:00`
      ),
      he: this.formatBrandedMessage(
        `${this.brandIcons.heart} *איך נוכל לעזור?*\n\n` +
        `📱 *פקודות:*\n` +
        `• תפריט - הצגת מוצרים\n` +
        `• הזמן <פריטים> - ביצוע הזמנה\n` +
        `• סטטוס - בדיקת מצב הזמנה\n` +
        `• ספקים - רשימת ספקים\n` +
        `• עזרה - הודעה זו\n\n` +
        `💬 *תמיכה:*\n` +
        `• טלפון: 08-123-4567\n` +
        `• מייל: support@kfarmarket.com\n` +
        `• שעות: א׳-ה׳ 8:00-18:00`
      )
    };
    
    return this.sendBrandedMessage(to, helpText[language]);
  }

  // Webhook handler for incoming messages
  async handleWebhook(req, res) {
    const { Body, From, MessageSid, MediaUrl0 } = req.body;
    
    try {
      // Process the incoming message
      await this.processIncomingMessage(From, Body, {
        messageId: MessageSid,
        mediaUrl: MediaUrl0
      });
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error processing message');
    }
  }
}

module.exports = BrandedWhatsAppService;