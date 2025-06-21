/**
 * KFAR Marketplace - WhatsApp Message Templates
 * 
 * Pre-approved templates for WhatsApp Business API
 * All templates include KFAR branding elements
 */

const brandElements = {
  // Brand emojis
  icons: {
    leaf: '🌿',
    africa: '🌍',
    heart: '💚',
    star: '⭐',
    check: '✅',
    cart: '🛒',
    package: '📦',
    delivery: '🚚',
    payment: '💳',
    celebration: '🎉',
    fresh: '🥬',
    organic: '🌱',
    vegan: '🌾',
    community: '🤝'
  },
  
  // Brand signatures
  headers: {
    en: '🌿 KFAR Marketplace 🌿',
    he: '🌿 שוק כפר 🌿'
  },
  
  footers: {
    en: '🌍 Village of Peace, Dimona 🌍\n_Authentic Vegan Marketplace_',
    he: '🌍 כפר השלום, דימונה 🌍\n_שוק טבעוני אותנטי_'
  },
  
  // Visual separators
  separator: '━━━━━━━━━━━━━━━━━━━━━'
};

// Message templates organized by category
const templates = {
  // Customer onboarding templates
  onboarding: {
    welcome: {
      name: 'welcome_message',
      category: 'UTILITY',
      languages: {
        en: {
          header: brandElements.headers.en,
          body: `${brandElements.icons.heart} Welcome {{1}}!

Thank you for joining our community of authentic vegan vendors and conscious consumers.

${brandElements.icons.check} *What you can do:*
• Browse organic produce ${brandElements.icons.fresh}
• Order from local vendors ${brandElements.icons.community}
• Track deliveries ${brandElements.icons.delivery}
• Support our community ${brandElements.icons.africa}

Quick commands:
*MENU* - View products
*HELP* - Get assistance`,
          footer: brandElements.footers.en,
          example: ['David']
        },
        he: {
          header: brandElements.headers.he,
          body: `${brandElements.icons.heart} ברוכים הבאים {{1}}!

תודה שהצטרפתם לקהילת הספקים הטבעוניים והצרכנים המודעים שלנו.

${brandElements.icons.check} *מה אפשר לעשות:*
• לעיין בתוצרת אורגנית ${brandElements.icons.fresh}
• להזמין מספקים מקומיים ${brandElements.icons.community}
• לעקוב אחר משלוחים ${brandElements.icons.delivery}
• לתמוך בקהילה שלנו ${brandElements.icons.africa}

פקודות מהירות:
*תפריט* - הצגת מוצרים
*עזרה* - קבלת סיוע`,
          footer: brandElements.footers.he,
          example: ['דוד']
        }
      }
    }
  },
  
  // Order management templates
  orders: {
    confirmation: {
      name: 'order_confirmation',
      category: 'UTILITY',
      languages: {
        en: {
          header: `${brandElements.icons.check} Order Confirmed - KFAR`,
          body: `Hi {{1}}, your order #{{2}} is confirmed!

${brandElements.icons.cart} Order total: ₪{{3}}
${brandElements.icons.package} Items: {{4}} products
${brandElements.icons.delivery} Delivery: {{5}}

Track your order:
kfarmarket.com/orders/{{2}}

Thank you for supporting local vegan vendors!`,
          footer: brandElements.footers.en,
          example: ['Sarah', 'KFR-2024-001', '156.50', '5', 'Tomorrow 2-4 PM']
        },
        he: {
          header: `${brandElements.icons.check} הזמנה אושרה - כפר`,
          body: `שלום {{1}}, הזמנה #{{2}} אושרה!

${brandElements.icons.cart} סה"כ הזמנה: ₪{{3}}
${brandElements.icons.package} פריטים: {{4}} מוצרים
${brandElements.icons.delivery} משלוח: {{5}}

מעקב הזמנה:
kfarmarket.com/orders/{{2}}

תודה על התמיכה בספקים טבעוניים מקומיים!`,
          footer: brandElements.footers.he,
          example: ['שרה', 'KFR-2024-001', '156.50', '5', 'מחר 14:00-16:00']
        }
      }
    },
    
    statusUpdate: {
      name: 'order_status_update',
      category: 'UTILITY',
      languages: {
        en: {
          header: `${brandElements.icons.delivery} Order Update - KFAR`,
          body: `Hi {{1}}!

Your order #{{2}} is now {{3}}.

${brandElements.icons.package} Next step: {{4}}
${brandElements.icons.delivery} Expected: {{5}}

Questions? Reply HELP`,
          footer: 'KFAR Marketplace',
          example: ['David', 'KFR-2024-001', 'being prepared', 'Delivery assignment', '2 hours']
        }
      }
    }
  },
  
  // Vendor notifications
  vendors: {
    newOrder: {
      name: 'vendor_new_order',
      category: 'ALERT_UPDATE',
      languages: {
        en: {
          header: `${brandElements.icons.star} New Order Alert - KFAR`,
          body: `Hello {{1}}!

You have a new order #{{2}}:

${brandElements.icons.cart} Items: {{3}}
${brandElements.icons.payment} Amount: ₪{{4}}
${brandElements.icons.delivery} Requested: {{5}}

Please confirm preparation time in vendor portal.`,
          footer: 'KFAR Vendor Services',
          example: ['Garden of Light', 'KFR-2024-001', '3 items', '89.50', 'ASAP']
        }
      }
    }
  },
  
  // Marketing templates (requires approval)
  marketing: {
    weeklySpecials: {
      name: 'weekly_specials',
      category: 'MARKETING',
      languages: {
        en: {
          header: `${brandElements.icons.star} Weekly Specials at KFAR`,
          body: `Hi {{1}}!

This week's fresh picks ${brandElements.icons.fresh}:

${brandElements.icons.organic} Organic tomatoes - 20% off
${brandElements.icons.vegan} New vegan cheese arrival
${brandElements.icons.leaf} Fresh herbs from local gardens

Order now: Reply MENU
Opt-out: Reply STOP`,
          footer: brandElements.footers.en,
          example: ['Sarah']
        }
      }
    }
  },
  
  // Interactive templates
  interactive: {
    productCatalog: {
      name: 'product_catalog',
      type: 'list',
      languages: {
        en: {
          header: 'Browse KFAR Products',
          body: 'Select a category to explore:',
          button: 'View Categories',
          sections: [
            {
              title: 'Fresh & Organic',
              rows: [
                { id: 'produce', title: '🥬 Fresh Produce', description: 'Organic fruits & vegetables' },
                { id: 'herbs', title: '🌿 Herbs & Greens', description: 'Fresh from our gardens' }
              ]
            },
            {
              title: 'Prepared Foods',
              rows: [
                { id: 'deli', title: '🥘 Vegan Deli', description: 'Ready-to-eat items' },
                { id: 'bakery', title: '🍞 Fresh Bakery', description: 'Daily baked goods' }
              ]
            }
          ]
        }
      }
    },
    
    quickActions: {
      name: 'quick_actions',
      type: 'button',
      languages: {
        en: {
          header: 'KFAR Quick Actions',
          body: 'What would you like to do?',
          buttons: [
            { id: 'menu', title: '📱 View Menu' },
            { id: 'status', title: '📦 Order Status' },
            { id: 'help', title: '💬 Get Help' }
          ]
        }
      }
    }
  }
};

// Helper function to format template with brand styling
function formatTemplate(template, params = {}, locale = 'en') {
  let formatted = template;
  
  // Add header separator
  if (template.header) {
    formatted = `${template.header}\n${brandElements.separator}\n\n${formatted}`;
  }
  
  // Add footer separator
  if (template.footer) {
    formatted = `${formatted}\n\n${brandElements.separator}\n${template.footer}`;
  }
  
  // Replace parameters
  Object.keys(params).forEach(key => {
    formatted = formatted.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
  });
  
  return formatted;
}

// Export templates and utilities
module.exports = {
  templates,
  brandElements,
  formatTemplate,
  
  // Quick access methods
  getWelcomeMessage: (name, locale = 'en') => {
    return formatTemplate(
      templates.onboarding.welcome.languages[locale],
      { 1: name },
      locale
    );
  },
  
  getOrderConfirmation: (params, locale = 'en') => {
    return formatTemplate(
      templates.orders.confirmation.languages[locale],
      params,
      locale
    );
  },
  
  getVendorAlert: (params, locale = 'en') => {
    return formatTemplate(
      templates.vendors.newOrder.languages[locale],
      params,
      locale
    );
  }
};