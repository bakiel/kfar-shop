'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface FAQItem {
  id: string;
  question: string;
  questionHe: string;
  answer: string;
  answerHe: string;
  category: string;
  helpful: number;
}

const FAQ_DATA: FAQItem[] = [
  // Vendor FAQs
  {
    id: 'v1',
    question: 'How do I start selling on KFAR Marketplace?',
    questionHe: 'איך אני מתחיל למכור במרקט KFAR?',
    answer: 'Click on "Become a Vendor" and complete the onboarding process. You\'ll need to provide store information, upload products, and set up payment methods. The whole process takes about 15 minutes.',
    answerHe: 'לחץ על "הפוך לספק" והשלם את תהליך ההרשמה. תצטרך לספק מידע על החנות, להעלות מוצרים ולהגדיר אמצעי תשלום. כל התהליך לוקח כ-15 דקות.',
    category: 'vendor',
    helpful: 42
  },
  {
    id: 'v2',
    question: 'How do I generate invoices for my customers?',
    questionHe: 'איך אני מפיק חשבוניות ללקוחות שלי?',
    answer: 'Go to your Vendor Dashboard and click on "Point of Sale". You can add products, enter customer details, and generate professional PDF invoices with QR codes instantly.',
    answerHe: 'עבור ללוח הבקרה של הספק ולחץ על "נקודת מכירה". תוכל להוסיף מוצרים, להזין פרטי לקוח וליצור חשבוניות PDF מקצועיות עם קודי QR באופן מיידי.',
    category: 'vendor',
    helpful: 38
  },
  {
    id: 'v3',
    question: 'What percentage does KFAR take from sales?',
    questionHe: 'איזה אחוז KFAR לוקח מהמכירות?',
    answer: 'KFAR charges a small 5% commission on sales to maintain the platform. This covers payment processing, hosting, and community support.',
    answerHe: 'KFAR גובה עמלה קטנה של 5% על מכירות לתחזוקת הפלטפורמה. זה מכסה עיבוד תשלומים, אירוח ותמיכה קהילתית.',
    category: 'vendor',
    helpful: 35
  },
  
  // Customer FAQs
  {
    id: 'c1',
    question: 'What are Braysheet tokens?',
    questionHe: 'מה הם אסימוני ברייסשיט?',
    answer: 'Braysheet tokens are the Village of Peace community currency. They support local economy and can be earned through community participation or purchased directly.',
    answerHe: 'אסימוני ברייסשיט הם המטבע הקהילתי של כפר השלום. הם תומכים בכלכלה המקומית וניתן להרוויח אותם דרך השתתפות קהילתית או לקנות ישירות.',
    category: 'customer',
    helpful: 67
  },
  {
    id: 'c2',
    question: 'How do I track my order?',
    questionHe: 'איך אני עוקב אחרי ההזמנה שלי?',
    answer: 'After checkout, you\'ll receive an order number and QR code. You can track your order status in your account dashboard or scan the QR code for instant updates.',
    answerHe: 'לאחר התשלום, תקבל מספר הזמנה וקוד QR. תוכל לעקוב אחר סטטוס ההזמנה בלוח הבקרה שלך או לסרוק את קוד ה-QR לעדכונים מיידיים.',
    category: 'customer',
    helpful: 54
  },
  {
    id: 'c3',
    question: 'What delivery options are available?',
    questionHe: 'אילו אפשרויות משלוח זמינות?',
    answer: 'We offer: 1) Free pickup from Village of Peace, 2) Local delivery in Dimona (₪15), 3) Standard shipping across Israel (₪25), 4) International shipping (₪75).',
    answerHe: 'אנו מציעים: 1) איסוף חינם מכפר השלום, 2) משלוח מקומי בדימונה (₪15), 3) משלוח רגיל ברחבי ישראל (₪25), 4) משלוח בינלאומי (₪75).',
    category: 'customer',
    helpful: 48
  },
  
  // Payment FAQs
  {
    id: 'p1',
    question: 'What payment methods do you accept?',
    questionHe: 'אילו אמצעי תשלום אתם מקבלים?',
    answer: 'We accept Braysheet tokens, credit cards (Visa, Mastercard, Amex), bank transfers, and PayPal. QR code payments are also available for quick checkout.',
    answerHe: 'אנו מקבלים אסימוני ברייסשיט, כרטיסי אשראי (ויזה, מאסטרקארד, אמקס), העברות בנקאיות ופייפאל. תשלומי QR קוד זמינים גם לתשלום מהיר.',
    category: 'payment',
    helpful: 61
  },
  {
    id: 'p2',
    question: 'How do I get a refund?',
    questionHe: 'איך אני מקבל החזר כספי?',
    answer: 'Contact the vendor directly through the order page or WhatsApp. Most vendors offer a 14-day return policy for unopened items. Refunds are processed within 5-7 business days.',
    answerHe: 'צור קשר עם הספק ישירות דרך דף ההזמנה או וואטסאפ. רוב הספקים מציעים מדיניות החזרה של 14 יום עבור פריטים שלא נפתחו. החזרים מעובדים תוך 5-7 ימי עסקים.',
    category: 'payment',
    helpful: 33
  },
  
  // VOP Community FAQs
  {
    id: 'vop1',
    question: 'What is VOP certification?',
    questionHe: 'מה זה אישור VOP?',
    answer: 'VOP (Village of Peace) certification ensures products meet our community standards: vegan, organic when possible, ethically sourced, and supporting local economy.',
    answerHe: 'אישור VOP (כפר השלום) מבטיח שהמוצרים עומדים בסטנדרטים הקהילתיים שלנו: טבעוני, אורגני כשאפשר, מקור אתי ותמיכה בכלכלה המקומית.',
    category: 'community',
    helpful: 89
  },
  {
    id: 'vop2',
    question: 'How can I join group orders?',
    questionHe: 'איך אני יכול להצטרף להזמנות קבוצתיות?',
    answer: 'Group orders are announced in the community WhatsApp group and on the marketplace homepage. Click "Join Group Order" and add your items before the deadline.',
    answerHe: 'הזמנות קבוצתיות מוכרזות בקבוצת הוואטסאפ הקהילתית ובעמוד הבית של המרקט. לחץ על "הצטרף להזמנה קבוצתית" והוסף את הפריטים שלך לפני המועד האחרון.',
    category: 'community',
    helpful: 45
  }
];

export default function HelpCenter() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<{ [key: string]: boolean }>({});
  
  const categories = [
    { id: 'all', name: 'All Topics', nameHe: 'כל הנושאים', icon: 'fa-list' },
    { id: 'vendor', name: 'For Vendors', nameHe: 'לספקים', icon: 'fa-store' },
    { id: 'customer', name: 'For Customers', nameHe: 'ללקוחות', icon: 'fa-shopping-cart' },
    { id: 'payment', name: 'Payments', nameHe: 'תשלומים', icon: 'fa-credit-card' },
    { id: 'community', name: 'VOP Community', nameHe: 'קהילת כפר השלום', icon: 'fa-users' }
  ];
  
  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.questionHe.includes(searchQuery) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerHe.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });
  
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const markHelpful = (id: string) => {
    if (!helpfulVotes[id]) {
      setHelpfulVotes(prev => ({ ...prev, [id]: true }));
      // In production, update the helpful count in database
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {language === 'he' ? 'מרכז עזרה' : 'Help Center'}
        </h1>
        <p className="text-gray-600">
          {language === 'he' 
            ? 'מצא תשובות לשאלות הנפוצות ביותר'
            : 'Find answers to the most common questions'}
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'he' ? 'חפש שאלות...' : 'Search questions...'}
            className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:border-leaf-green"
          />
          <i className="fas fa-search absolute left-4 top-4 text-gray-400"></i>
        </div>
      </div>
      
      {/* Category Filters */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              selectedCategory === cat.id
                ? 'bg-leaf-green text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <i className={`fas ${cat.icon}`}></i>
            <span>{language === 'he' ? cat.nameHe : cat.name}</span>
          </button>
        ))}
      </div>
      
      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map(faq => (
          <div
            key={faq.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleExpanded(faq.id)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-800">
                {language === 'he' ? faq.questionHe : faq.question}
              </h3>
              <i className={`fas fa-chevron-${expandedItems.includes(faq.id) ? 'up' : 'down'} text-gray-400`}></i>
            </button>
            
            {expandedItems.includes(faq.id) && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 mb-4">
                  {language === 'he' ? faq.answerHe : faq.answer}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {language === 'he' ? 'האם זה עזר?' : 'Was this helpful?'}
                    </span>
                    <button
                      onClick={() => markHelpful(faq.id)}
                      disabled={helpfulVotes[faq.id]}
                      className={`px-3 py-1 rounded-full text-sm ${
                        helpfulVotes[faq.id]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <i className="fas fa-thumbs-up mr-1"></i>
                      {faq.helpful + (helpfulVotes[faq.id] ? 1 : 0)}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="text-sm text-leaf-green hover:underline">
                      <i className="fas fa-share mr-1"></i>
                      {language === 'he' ? 'שתף' : 'Share'}
                    </button>
                    <button className="text-sm text-leaf-green hover:underline">
                      <i className="fas fa-print mr-1"></i>
                      {language === 'he' ? 'הדפס' : 'Print'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Contact Support */}
      <div className="mt-12 bg-gradient-to-r from-leaf-green to-sun-gold rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">
          {language === 'he' ? 'עדיין צריך עזרה?' : 'Still Need Help?'}
        </h2>
        <p className="mb-6">
          {language === 'he'
            ? 'הצוות שלנו כאן כדי לעזור לך'
            : 'Our team is here to assist you'}
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-white text-leaf-green rounded-lg font-semibold hover:bg-gray-100">
            <i className="fab fa-whatsapp mr-2"></i>
            WhatsApp Support
          </button>
          <button className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30">
            <i className="fas fa-envelope mr-2"></i>
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
}