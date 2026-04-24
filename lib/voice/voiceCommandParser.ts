// Voice command parser for natural language processing
export interface ParsedCommand {
  intent: CommandIntent;
  entities: CommandEntities;
  confidence: number;
  originalText: string;
}

export enum CommandIntent {
  SEARCH_PRODUCT = 'search_product',
  ADD_TO_CART = 'add_to_cart',
  SHOW_CART = 'show_cart',
  CHECKOUT = 'checkout',
  SHOW_DEALS = 'show_deals',
  SHOW_BESTSELLERS = 'show_bestsellers',
  FILTER_PRICE = 'filter_price',
  REPEAT_ORDER = 'repeat_order',
  QUANTITY_CHANGE = 'quantity_change',
  VENDOR_INFO = 'vendor_info',
  DIETARY_FILTER = 'dietary_filter',
  HELP = 'help',
  UNKNOWN = 'unknown'
}

export interface CommandEntities {
  product?: string;
  vendor?: string;
  price?: number;
  quantity?: number;
  dietary?: string[];
  action?: string;
}

// Multi-language command patterns
const COMMAND_PATTERNS = {
  en: {
    search: [
      /(?:show me|find|search for|I need|I want|looking for) (.+)/i,
      /(?:do you have|is there any) (.+)/i,
      /(.+) (?:please|available)/i
    ],
    addToCart: [
      /(?:add|yes|add it|add to cart|buy it|I'll take it)/i,
      /(?:add) (\d+) (?:of them|items)/i,
      /(?:give me) (\d+)/i
    ],
    showCart: [
      /(?:what's in my cart|show cart|cart total|my items)/i,
      /(?:how much|what's the total)/i
    ],
    checkout: [
      /(?:checkout|pay|complete order|finish|done shopping)/i,
      /(?:ready to pay|let's checkout)/i
    ],
    deals: [
      /(?:what's on sale|show deals|specials|discounts|offers)/i,
      /(?:any deals|promotions)/i
    ],
    bestsellers: [
      /(?:best sellers|popular|top products|most bought)/i,
      /(?:what's popular|trending)/i
    ],
    priceFilter: [
      /(?:under|less than|below|cheaper than) (?:₪|ILS|NIS)?(\d+)/i,
      /(?:between) (?:₪|ILS|NIS)?(\d+) (?:and|to) (?:₪|ILS|NIS)?(\d+)/i
    ],
    dietary: [
      /(?:show me|only) (vegan|kosher|organic|gluten[- ]free) (?:products|items|food)?/i,
      /(?:filter by|just) (vegan|kosher|organic)/i
    ],
    help: [
      /(?:help|what can you do|commands|how to use|capabilities|introduction)/i,
      /(?:tell me what you can do|how do I use this)/i
    ]
  },
  he: {
    search: [
      /(?:תראה לי|חפש|אני צריך|אני רוצה) (.+)/,
      /(?:יש לכם|האם יש) (.+)/
    ],
    addToCart: [
      /(?:הוסף|כן|הוסף לעגלה|קנה)/,
      /(?:תן לי|אני לוקח) (\d+)/
    ],
    showCart: [
      /(?:מה בעגלה|הראה עגלה|כמה זה עולה)/,
      /(?:מה הסכום|כמה לשלם)/
    ],
    checkout: [
      /(?:לתשלום|לקופה|סיים קנייה|בוא נשלם)/
    ],
    deals: [
      /(?:מה במבצע|מבצעים|הנחות|מה בהנחה)/
    ],
    bestsellers: [
      /(?:הכי נמכרים|פופולרי|מה קונים)/
    ],
    priceFilter: [
      /(?:מתחת ל|פחות מ|עד) (?:₪)?(\d+)/,
      /(?:בין) (?:₪)?(\d+) (?:ל) (?:₪)?(\d+)/
    ],
    dietary: [
      /(?:רק|תראה לי) (טבעוני|כשר|אורגני) (?:מוצרים|אוכל)?/
    ]
  },
  ar: {
    search: [
      /(?:أرني|ابحث عن|أريد|أحتاج) (.+)/,
      /(?:هل لديكم|هل يوجد) (.+)/
    ],
    addToCart: [
      /(?:أضف|نعم|أضف إلى السلة|اشتر)/,
      /(?:أعطني|سآخذ) (\d+)/
    ],
    showCart: [
      /(?:ما في السلة|أظهر السلة|كم السعر)/
    ],
    checkout: [
      /(?:الدفع|إنهاء الشراء|دعنا ندفع)/
    ],
    deals: [
      /(?:ما هي العروض|عروض|خصومات)/
    ],
    bestsellers: [
      /(?:الأكثر مبيعا|شعبي|ماذا يشترون)/
    ],
    priceFilter: [
      /(?:أقل من|تحت) (?:₪)?(\d+)/
    ],
    dietary: [
      /(?:فقط|أرني) (نباتي|كوشر|عضوي)/
    ]
  }
};

// Entity extraction helpers
function extractProduct(text: string): string | undefined {
  // Remove command words and extract product name
  const cleanText = text
    .replace(/(?:show me|find|search for|I need|I want|looking for)/gi, '')
    .replace(/(?:תראה לי|חפש|אני צריך|אני רוצה)/g, '')
    .replace(/(?:أرني|ابحث عن|أريد|أحتاج)/g, '')
    .trim();
  
  return cleanText || undefined;
}

function extractQuantity(text: string): number | undefined {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

function extractPrice(text: string): number | undefined {
  const match = text.match(/(?:₪|ILS|NIS)?(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

function extractDietary(text: string): string[] {
  const dietary: string[] = [];
  const terms = {
    en: ['vegan', 'kosher', 'organic', 'gluten-free', 'gluten free'],
    he: ['טבעוני', 'כשר', 'אורגני', 'ללא גלוטן'],
    ar: ['نباتي', 'كوشر', 'عضوي', 'خالي من الغلوتين']
  };
  
  Object.values(terms).flat().forEach(term => {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      dietary.push(term);
    }
  });
  
  return dietary;
}

// Main parser function
export function parseVoiceCommand(text: string, language: 'en' | 'he' | 'ar' = 'en'): ParsedCommand {
  const patterns = COMMAND_PATTERNS[language];
  let highestConfidence = 0;
  let detectedIntent = CommandIntent.UNKNOWN;
  let entities: CommandEntities = {};
  
  // Check search patterns
  patterns.search.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      detectedIntent = CommandIntent.SEARCH_PRODUCT;
      entities.product = extractProduct(text);
      highestConfidence = Math.max(highestConfidence, 0.9);
    }
  });
  
  // Check add to cart patterns
  patterns.addToCart.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      detectedIntent = CommandIntent.ADD_TO_CART;
      entities.quantity = extractQuantity(text) || 1;
      highestConfidence = Math.max(highestConfidence, 0.95);
    }
  });
  
  // Check cart patterns
  patterns.showCart.forEach(pattern => {
    if (text.match(pattern)) {
      detectedIntent = CommandIntent.SHOW_CART;
      highestConfidence = Math.max(highestConfidence, 0.95);
    }
  });
  
  // Check checkout patterns
  patterns.checkout.forEach(pattern => {
    if (text.match(pattern)) {
      detectedIntent = CommandIntent.CHECKOUT;
      highestConfidence = Math.max(highestConfidence, 0.95);
    }
  });
  
  // Check deals patterns
  patterns.deals.forEach(pattern => {
    if (text.match(pattern)) {
      detectedIntent = CommandIntent.SHOW_DEALS;
      highestConfidence = Math.max(highestConfidence, 0.9);
    }
  });
  
  // Check bestsellers patterns
  patterns.bestsellers.forEach(pattern => {
    if (text.match(pattern)) {
      detectedIntent = CommandIntent.SHOW_BESTSELLERS;
      highestConfidence = Math.max(highestConfidence, 0.9);
    }
  });
  
  // Check price filter patterns
  patterns.priceFilter.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      detectedIntent = CommandIntent.FILTER_PRICE;
      entities.price = extractPrice(text);
      highestConfidence = Math.max(highestConfidence, 0.85);
    }
  });
  
  // Check dietary patterns
  patterns.dietary.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      detectedIntent = CommandIntent.DIETARY_FILTER;
      entities.dietary = extractDietary(text);
      highestConfidence = Math.max(highestConfidence, 0.9);
    }
  });
  
  // Check help patterns
  patterns.help?.forEach(pattern => {
    if (text.match(pattern)) {
      detectedIntent = CommandIntent.HELP;
      highestConfidence = Math.max(highestConfidence, 0.95);
    }
  });
  
  // If no pattern matched but contains product-like words
  if (detectedIntent === CommandIntent.UNKNOWN && text.length > 2) {
    // Simple heuristic: if it's short and doesn't match other patterns, assume product search
    if (text.split(' ').length <= 3) {
      detectedIntent = CommandIntent.SEARCH_PRODUCT;
      entities.product = text;
      highestConfidence = 0.7;
    }
  }
  
  return {
    intent: detectedIntent,
    entities,
    confidence: highestConfidence,
    originalText: text
  };
}

// Export helper to get intent description
export function getIntentDescription(intent: CommandIntent): string {
  const descriptions = {
    [CommandIntent.SEARCH_PRODUCT]: 'Searching for products',
    [CommandIntent.ADD_TO_CART]: 'Adding to cart',
    [CommandIntent.SHOW_CART]: 'Showing cart',
    [CommandIntent.CHECKOUT]: 'Going to checkout',
    [CommandIntent.SHOW_DEALS]: 'Showing deals',
    [CommandIntent.SHOW_BESTSELLERS]: 'Showing bestsellers',
    [CommandIntent.FILTER_PRICE]: 'Filtering by price',
    [CommandIntent.REPEAT_ORDER]: 'Repeating order',
    [CommandIntent.QUANTITY_CHANGE]: 'Changing quantity',
    [CommandIntent.VENDOR_INFO]: 'Getting vendor info',
    [CommandIntent.DIETARY_FILTER]: 'Filtering by dietary preference',
    [CommandIntent.HELP]: 'Getting help',
    [CommandIntent.UNKNOWN]: 'Processing request'
  };
  
  return descriptions[intent] || 'Processing';
}