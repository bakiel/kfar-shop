// config/voice.ts
export const VOICE_CONFIG = {
  daniella: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DANIELLA || 'Z3R5wn05IrDiVCyEkUrK',
    name: 'Akhot Daniella',
    nameHebrew: 'אחות דניאלה',
    nameArabic: 'الأخت دانييلا',
    gender: 'female',
    settings: {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.5,
      use_speaker_boost: true
    },
    description: {
      en: 'A warm and caring voice, perfect for assistance',
      he: 'קול חם ואכפתי, מושלם לסיוע',
      ar: 'صوت دافئ ومهتم، مثالي للمساعدة'
    }
  },
  yaakov: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YAAKOV || 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Akh Yaakov',
    nameHebrew: 'אח יעקב',
    nameArabic: 'الأخ يعقوب',
    gender: 'male',
    settings: {
      stability: 0.8,
      similarity_boost: 0.75,
      style: 0.4,
      use_speaker_boost: true
    },
    description: {
      en: 'A knowledgeable and friendly voice',
      he: 'קול ידעני וידידותי',
      ar: 'صوت عليم وودود'
    }
  }
} as const;

export type VoiceAssistant = keyof typeof VOICE_CONFIG;

// Language configuration
export const LANGUAGE_CONFIG = {
  he: {
    code: 'he-IL',
    name: 'עברית',
    direction: 'rtl',
    speechRecognition: 'he-IL'
  },
  en: {
    code: 'en-US',
    name: 'English',
    direction: 'ltr',
    speechRecognition: 'en-US'
  },
  ar: {
    code: 'ar-SA',
    name: 'العربية',
    direction: 'rtl',
    speechRecognition: 'ar-SA'
  }
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;

// Default chat greetings - Sales focused
export const GREETINGS = {
  he: {
    yaakov: 'שלום! אני יעקב. מה תרצה למצוא היום?',
    daniella: 'שלום! אני דניאלה. מחפשת משהו מיוחד?'
  },
  en: {
    yaakov: "Shalom! I'm Yaakov. What can I help you find today?",
    daniella: "Hi there! I'm Daniella. Looking for something special?"
  },
  ar: {
    yaakov: 'شالوم! أنا يعقوب. ماذا تريد أن تجد اليوم؟',
    daniella: 'مرحبا! أنا دانييلا. تبحث عن شيء خاص؟'
  }
} as const;

// Chat suggestions - Commerce focused
export const SUGGESTIONS = {
  he: [
    'מה במבצע היום?',
    'הוסף לעגלה',
    'המוצרים הכי נמכרים',
    'מתחת ל-50 שקל',
    'לתשלום'
  ],
  en: [
    "What's on sale?",
    'Best sellers',
    'Add to cart',
    'Under 50 shekels',
    'Checkout'
  ],
  ar: [
    'ما هي العروض اليوم؟',
    'الأكثر مبيعا',
    'أضف إلى السلة',
    'أقل من 50 شيكل',
    'الدفع'
  ]
} as const;

// Voice agent capabilities introduction
export const AGENT_INTRO = {
  he: {
    yaakov: `שלום! אני יעקב, העוזר הקולי שלך. אני יכול לעזור לך:
    למצוא מוצרים - פשוט תגיד "תראה לי חומוס" או כל מוצר אחר
    לראות מבצעים - שאל "מה במבצע היום?"
    להוסיף לעגלה - אמור "הוסף לעגלה" אחרי שמצאת מוצר
    לנהל את העגלה - "מה בעגלה שלי?" או "הסר פריט"
    לעבור לתשלום - פשוט תגיד "לתשלום"
    אני מבין עברית, אנגלית וערבית. איך אוכל לעזור לך היום?`,
    
    daniella: `היי! אני דניאלה, המדריכה הקולית שלך לקניות. אני יכולה:
    לחפש מוצרים - תגידי "אני צריכה טחינה" או כל מוצר
    להראות לך הנחות - "מה יש במבצע?"
    לעזור עם הקנייה - "הוסיפי לעגלה" כשתמצאי משהו
    לנהל את ההזמנה - "כמה זה עולה?" או "תראי לי את העגלה"
    מה את מחפשת היום?`
  },
  en: {
    yaakov: `Hello! I'm Yaakov, your voice shopping assistant. I can help you:
    Find products - Just say "show me hummus" or any product
    Check deals - Ask "what's on sale today?"
    Add to cart - Say "add to cart" after finding a product
    Manage your cart - "What's in my cart?" or "remove item"
    Checkout - Simply say "checkout" when ready
    I understand English, Hebrew, and Arabic. How can I help you shop today?`,
    
    daniella: `Hi there! I'm Daniella, your voice shopping guide. I can:
    Search products - Say "I need tahini" or any item
    Show you deals - "What's on special?"
    Help you buy - "Add it to cart" when you find something
    Track your order - "What's my total?" or "show cart"
    What are you looking for today?`
  },
  ar: {
    yaakov: `مرحبا! أنا يعقوب، مساعد التسوق الصوتي. يمكنني مساعدتك في:
    البحث عن المنتجات - قل "أرني الحمص" أو أي منتج
    معرفة العروض - اسأل "ما هي عروض اليوم؟"
    الإضافة للسلة - قل "أضف إلى السلة"
    إدارة السلة - "ما في سلتي؟" أو "أزل المنتج"
    الدفع - قل "الدفع" عندما تكون جاهزًا
    أفهم العربية والعبرية والإنجليزية. كيف يمكنني مساعدتك؟`,
    
    daniella: `أهلاً! أنا دانييلا، دليل التسوق الصوتي. يمكنني:
    البحث عن المنتجات - قولي "أحتاج طحينة" أو أي شيء
    عرض التخفيضات - "ما هي العروض الخاصة؟"
    المساعدة في الشراء - "أضيفيه للسلة"
    تتبع طلبك - "كم المجموع؟" أو "أظهري السلة"
    ماذا تبحثين عنه اليوم؟`
  }
} as const;

// Quick voice commands reference
export const VOICE_COMMANDS = {
  search: ['show me', 'find', 'I need', 'I want', 'looking for'],
  deals: ["what's on sale", 'specials', 'discounts', 'deals today'],
  cart: ['add to cart', 'remove from cart', "what's in my cart", 'cart total'],
  checkout: ['checkout', 'pay', 'complete order', 'finish shopping'],
  help: ['help', 'what can you do', 'commands', 'how to use']
} as const;
