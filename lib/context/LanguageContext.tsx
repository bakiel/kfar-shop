'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageContextType {
  language: 'en' | 'he';
  setLanguage: (lang: 'en' | 'he') => void;
  toggleLanguage: () => void;
  t: (text: string, context?: 'store_name' | 'product_name' | 'description') => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Common translations cache
const commonTranslations: Record<string, Record<'en' | 'he', string>> = {
  // Vendor Names
  'Teva Deli': { en: 'Teva Deli', he: 'טבע דלי' },
  "Queen's Cuisine": { en: "Queen's Cuisine", he: 'המטבח של המלכה' },
  'Gahn Delight': { en: 'Gahn Delight', he: 'גן תענוג' },
  "People's Store": { en: "People's Store", he: 'חנות העם' },
  'People Store': { en: 'People Store', he: 'חנות העם' },
  'VOP Shop': { en: 'VOP Shop', he: 'חנות כפר השלום' },
  'Village of Peace Shop': { en: 'Village of Peace Shop', he: 'חנות כפר השלום' },
  'Garden of Light': { en: 'Garden of Light', he: 'גן האור' },

  // Navigation
  'Home': { en: 'Home', he: 'בית' },
  'Services': { en: 'Services', he: 'שירותים' },
  'Marketplace': { en: 'Marketplace', he: 'השוק' },
  'About': { en: 'About', he: 'אודות' },
  'Cart': { en: 'Cart', he: 'עגלה' },
  'Support': { en: 'Support', he: 'תמיכה' },
  'Join KFAR': { en: 'Join KFAR', he: 'הצטרף לכפר' },
  
  // Common actions
  'Add to Cart': { en: 'Add to Cart', he: 'הוסף לסל' },
  'View Cart': { en: 'View Cart', he: 'צפה בסל' },
  'Checkout': { en: 'Checkout', he: 'לתשלום' },
  'Search': { en: 'Search', he: 'חיפוש' },
  'Login': { en: 'Login', he: 'התחברות' },
  'Register': { en: 'Register', he: 'הרשמה' },
  'Logout': { en: 'Logout', he: 'התנתקות' },
  
  // Product
  'In Stock': { en: 'In Stock', he: 'במלאי' },
  'Out of Stock': { en: 'Out of Stock', he: 'אזל המלאי' },
  'Reviews': { en: 'Reviews', he: 'ביקורות' },
  'Description': { en: 'Description', he: 'תיאור' },
  
  // Vendors
  'All Vendors': { en: 'All Vendors', he: 'כל הספקים' },
  'Featured Products': { en: 'Featured Products', he: 'מוצרים מומלצים' },
  'New Arrivals': { en: 'New Arrivals', he: 'הגעות חדשות' },
  
  // Customer
  'Sign In': { en: 'Sign In', he: 'התחבר' },
  'Sign Up': { en: 'Sign Up', he: 'הרשמה' },
  'My Account': { en: 'My Account', he: 'החשבון שלי' },
  'Orders': { en: 'Orders', he: 'הזמנות' },
  
  // Payment
  'Total': { en: 'Total', he: 'סה"כ' },
  'Subtotal': { en: 'Subtotal', he: 'סכום ביניים' },
  'Shipping': { en: 'Shipping', he: 'משלוח' },
  'Tax': { en: 'Tax', he: 'מס' },
  'Payment Method': { en: 'Payment Method', he: 'אמצעי תשלום' },
  
  // Login Portal
  'KFAR Access Portal': { en: 'KFAR Access Portal', he: 'פורטל כפר' },
  'Choose your role to continue': { en: 'Choose your role to continue', he: 'בחר את התפקיד שלך כדי להמשיך' },
  'Customer': { en: 'Customer', he: 'לקוח' },
  'Shop & track your orders': { en: 'Shop & track your orders', he: 'קנה ועקוב אחרי ההזמנות' },
  'Customer Login': { en: 'Customer Login', he: 'התחברות לקוח' },
  'Demo Access:': { en: 'Demo Access:', he: 'גישה לדמו:' },
  'Use any email/password': { en: 'Use any email/password', he: 'השתמש בכל אימייל/סיסמה' },
  'to create a demo account': { en: 'to create a demo account', he: 'ליצירת חשבון דמו' },
  'New? Start onboarding →': { en: 'New? Start onboarding →', he: 'חדש? התחל הכנה ←' },
  'Vendor': { en: 'Vendor', he: 'ספק' },
  'Manage your store': { en: 'Manage your store', he: 'נהל את החנות שלך' },
  'Vendor Portal': { en: 'Vendor Portal', he: 'פורטל ספקים' },
  'Demo Credentials:': { en: 'Demo Credentials:', he: 'פרטי דמו:' },
  'New vendor? Join us →': { en: 'New vendor? Join us →', he: 'ספק חדש? הצטרף אלינו ←' },
  'Admin': { en: 'Admin', he: 'מנהל' },
  'Platform management': { en: 'Platform management', he: 'ניהול פלטפורמה' },
  'Admin Access': { en: 'Admin Access', he: 'גישת מנהל' },
  'Platform overview →': { en: 'Platform overview →', he: 'סקירת פלטפורמה ←' },
  'Just Testing?': { en: 'Just Testing?', he: 'רק בודק?' },
  'Skip the login and test all features with our demo center': { en: 'Skip the login and test all features with our demo center', he: 'דלג על ההתחברות ובדוק את כל התכונות במרכז הדמו' },
  'Open Demo Center': { en: 'Open Demo Center', he: 'פתח מרכז דמו' },
  
  // Customer Login Page
  'Welcome to KFAR': { en: 'Welcome to KFAR', he: 'ברוכים הבאים לכפר' },
  'Join the Village of Peace Community': { en: 'Join the Village of Peace Community', he: 'הצטרפו לקהילת כפר השלום' },
  'Welcome Back!': { en: 'Welcome Back!', he: 'ברוכים השבים!' },
  'Join KFAR': { en: 'Join KFAR', he: 'הצטרף לכפר' },
  'Access your personalized dashboard': { en: 'Access your personalized dashboard', he: 'גש לדשבורד האישי שלך' },
  'Start your journey with us': { en: 'Start your journey with us', he: 'התחל את המסע שלך איתנו' },
  'Full Name': { en: 'Full Name', he: 'שם מלא' },
  'Your name': { en: 'Your name', he: 'השם שלך' },
  'Email': { en: 'Email', he: 'אימייל' },
  'Password': { en: 'Password', he: 'סיסמה' },
  'Phone (Optional)': { en: 'Phone (Optional)', he: 'טלפון (אופציונלי)' },
  'Remember me': { en: 'Remember me', he: 'זכור אותי' },
  'Forgot password?': { en: 'Forgot password?', he: 'שכחת סיסמה?' },
  'Create Account': { en: 'Create Account', he: 'צור חשבון' },
  'Processing...': { en: 'Processing...', he: 'מעבד...' },
  'Try Demo Account': { en: 'Try Demo Account', he: 'נסה חשבון דמו' },
  'Or continue with': { en: 'Or continue with', he: 'או המשך עם' },
  'Google': { en: 'Google', he: 'גוגל' },
  'Facebook': { en: 'Facebook', he: 'פייסבוק' },
  'Why Create an Account?': { en: 'Why Create an Account?', he: 'למה ליצור חשבון?' },
  'Earn loyalty points': { en: 'Earn loyalty points', he: 'צבור נקודות נאמנות' },
  'Exclusive discounts': { en: 'Exclusive discounts', he: 'הנחות בלעדיות' },
  'Order history': { en: 'Order history', he: 'היסטוריית הזמנות' },
  'Save favorites': { en: 'Save favorites', he: 'שמור מועדפים' },
  'Voice shopping': { en: 'Voice shopping', he: 'קניות קוליות' },
  'AI assistance': { en: 'AI assistance', he: 'עזרת בינה מלאכותית' },
  'New to KFAR?': { en: 'New to KFAR?', he: 'חדש בכפר?' },
  'Create an account': { en: 'Create an account', he: 'צור חשבון' },
  'Already have an account?': { en: 'Already have an account?', he: 'כבר יש לך חשבון?' },
  
  // Marketplace
  'Search products...': { en: 'Search products...', he: 'חפש מוצרים...' },
  'Search products, tags, or scan QR...': { en: 'Search products, tags, or scan QR...', he: 'חפש מוצרים, תגיות או סרוק QR...' },
  'Filters': { en: 'Filters', he: 'סינון' },
  'Active Filters:': { en: 'Active Filters:', he: 'סינונים פעילים:' },
  'Clear All Filters': { en: 'Clear All Filters', he: 'נקה את כל הסינונים' },
  'Featured': { en: 'Featured', he: 'מומלץ' },
  'Sort by': { en: 'Sort by', he: 'מיין לפי' },
  'Price': { en: 'Price', he: 'מחיר' },
  'Name': { en: 'Name', he: 'שם' },
  'Rating': { en: 'Rating', he: 'דירוג' },
  'Category': { en: 'Category', he: 'קטגוריה' },
  'All Categories': { en: 'All Categories', he: 'כל הקטגוריות' },
  'Vendor': { en: 'Vendor', he: 'ספק' },
  'All Vendors': { en: 'All Vendors', he: 'כל הספקים' },
  'Organic': { en: 'Organic', he: 'אורגני' },
  'Vegan': { en: 'Vegan', he: 'טבעוני' },
  'Gluten Free': { en: 'Gluten Free', he: 'ללא גלוטן' },
  'Kosher': { en: 'Kosher', he: 'כשר' },
  'Low Price': { en: 'Low Price', he: 'מחיר נמוך' },
  'High Price': { en: 'High Price', he: 'מחיר גבוה' },
  'Best Rating': { en: 'Best Rating', he: 'דירוג הטוב ביותר' },
  'Newest': { en: 'Newest', he: 'החדש ביותר' },
  'Popular': { en: 'Popular', he: 'פופולרי' },
  
  // Hero Section
  'Voice Shopping': { en: 'Voice Shopping', he: 'קניות קוליות' },
  'Shop Smarter': { en: 'Shop Smarter', he: 'קנה חכם יותר' },
  'With AI': { en: 'With AI', he: 'עם בינה מלאכותית' },
  'Order with your voice, track with QR codes, enjoy same-day delivery': { en: 'Order with your voice, track with QR codes, enjoy same-day delivery', he: 'הזמן עם הקול שלך, עקוב עם קודי QR, תהנה ממשלוח באותו יום' },
  'Local Marketplace': { en: 'Local Marketplace', he: 'שוק מקומי' },
  'Support Your': { en: 'Support Your', he: 'תמכו ב' },
  'Community': { en: 'Community', he: 'קהילה' },
  'Shop from trusted local vendors with authentic products and great prices': { en: 'Shop from trusted local vendors with authentic products and great prices', he: 'קנו מספקים מקומיים מהימנים עם מוצרים אותנטיים ומחירים נהדרים' },
  '100% Secure': { en: '100% Secure', he: '100% מאובטח' },
  'Safe & Easy': { en: 'Safe & Easy', he: 'בטוח וקל' },
  'Shopping': { en: 'Shopping', he: 'קניות' },
  'SSL encrypted checkout, multiple payment options, satisfaction guaranteed': { en: 'SSL encrypted checkout, multiple payment options, satisfaction guaranteed', he: 'קופה מוצפנת SSL, אפשרויות תשלום מרובות, שביעות רצון מובטחת' },
  'businesses': { en: 'businesses', he: 'עסקים' },
  'products': { en: 'products', he: 'מוצרים' },
  'delivery': { en: 'delivery', he: 'משלוח' },
  'vendors': { en: 'vendors', he: 'ספקים' },
  'savings': { en: 'savings', he: 'חיסכון' },
  'reviews': { en: 'reviews', he: 'ביקורות' },
  'secure': { en: 'secure', he: 'מאובטח' },
  'support': { en: 'support', he: 'תמיכה' },
  'returns': { en: 'returns', he: 'החזרות' },
  'happy customers': { en: 'happy customers', he: 'לקוחות מרוצים' },
  "Today's Special Deals": { en: "Today's Special Deals", he: 'המבצעים המיוחדים של היום' },
  'Fresh promotions from our vendors • Updated every hour': { en: 'Fresh promotions from our vendors • Updated every hour', he: 'מבצעים טריים מהספקים שלנו • מעודכן כל שעה' },
  'Live Marketplace Feed': { en: 'Live Marketplace Feed', he: 'הזנה חיה של השוק' },
  'Explore Marketplace': { en: 'Explore Marketplace', he: 'חקור את השוק' },
  'Become a Vendor': { en: 'Become a Vendor', he: 'הפוך לספק' },
  'Secure Access': { en: 'Secure Access', he: 'גישה מאובטחת' },
  'Customer Portal': { en: 'Customer Portal', he: 'פורטל לקוחות' },
  
  // Additional UI Elements
  'Loading...': { en: 'Loading...', he: 'טוען...' },
  'Error': { en: 'Error', he: 'שגיאה' },
  'Success': { en: 'Success', he: 'הצלחה' },
  'Cancel': { en: 'Cancel', he: 'ביטול' },
  'Save': { en: 'Save', he: 'שמור' },
  'Delete': { en: 'Delete', he: 'מחק' },
  'Edit': { en: 'Edit', he: 'ערוך' },
  'Update': { en: 'Update', he: 'עדכן' },
  'Submit': { en: 'Submit', he: 'שלח' },
  'Back': { en: 'Back', he: 'חזור' },
  'Next': { en: 'Next', he: 'הבא' },
  'Previous': { en: 'Previous', he: 'הקודם' },
  'Close': { en: 'Close', he: 'סגור' },
  'Open': { en: 'Open', he: 'פתח' },
  'Select': { en: 'Select', he: 'בחר' },
  'Upload': { en: 'Upload', he: 'העלה' },
  'Download': { en: 'Download', he: 'הורד' },
  'Print': { en: 'Print', he: 'הדפס' },
  'Share': { en: 'Share', he: 'שתף' },
  'Copy': { en: 'Copy', he: 'העתק' },
  'Paste': { en: 'Paste', he: 'הדבק' },
  
  // Product Details
  'Add to Favorites': { en: 'Add to Favorites', he: 'הוסף למועדפים' },
  'Share Product': { en: 'Share Product', he: 'שתף מוצר' },
  'Product Details': { en: 'Product Details', he: 'פרטי מוצר' },
  'Quantity': { en: 'Quantity', he: 'כמות' },
  'Available': { en: 'Available', he: 'זמין' },
  'SKU': { en: 'SKU', he: 'מק"ט' },
  'Category': { en: 'Category', he: 'קטגוריה' },
  'Tags': { en: 'Tags', he: 'תגיות' },
  'Related Products': { en: 'Related Products', he: 'מוצרים קשורים' },
  
  // Cart & Checkout
  'Shopping Cart': { en: 'Shopping Cart', he: 'עגלת קניות' },
  'Your cart is empty': { en: 'Your cart is empty', he: 'העגלה שלך ריקה' },
  'Continue Shopping': { en: 'Continue Shopping', he: 'המשך בקניות' },
  'Apply Coupon': { en: 'Apply Coupon', he: 'הפעל קופון' },
  'Coupon Code': { en: 'Coupon Code', he: 'קוד קופון' },
  'Order Summary': { en: 'Order Summary', he: 'סיכום הזמנה' },
  'Proceed to Payment': { en: 'Proceed to Payment', he: 'המשך לתשלום' },
  'Billing Address': { en: 'Billing Address', he: 'כתובת חיוב' },
  'Shipping Address': { en: 'Shipping Address', he: 'כתובת משלוח' },
  'Same as billing': { en: 'Same as billing', he: 'זהה לכתובת החיוב' },
  'Order Notes': { en: 'Order Notes', he: 'הערות להזמנה' },
  'Place Order': { en: 'Place Order', he: 'בצע הזמנה' },
  
  // Vendor Dashboard
  'Vendor Dashboard': { en: 'Vendor Dashboard', he: 'לוח בקרה לספק' },
  'Total Revenue': { en: 'Total Revenue', he: 'הכנסות כוללות' },
  'Active Products': { en: 'Active Products', he: 'מוצרים פעילים' },
  'Pending Orders': { en: 'Pending Orders', he: 'הזמנות ממתינות' },
  'Recent Orders': { en: 'Recent Orders', he: 'הזמנות אחרונות' },
  'Order Status': { en: 'Order Status', he: 'סטטוס הזמנה' },
  'Processing': { en: 'Processing', he: 'בעיבוד' },
  'Shipped': { en: 'Shipped', he: 'נשלח' },
  'Delivered': { en: 'Delivered', he: 'נמסר' },
  'Cancelled': { en: 'Cancelled', he: 'בוטל' },
  'Refunded': { en: 'Refunded', he: 'הוחזר' },
  
  // Messages & Notifications
  'No new notifications': { en: 'No new notifications', he: 'אין התראות חדשות' },
  'Mark all as read': { en: 'Mark all as read', he: 'סמן הכל כנקרא' },
  'New message': { en: 'New message', he: 'הודעה חדשה' },
  'Reply': { en: 'Reply', he: 'הגב' },
  'Forward': { en: 'Forward', he: 'העבר' },
  
  // Time
  'Today': { en: 'Today', he: 'היום' },
  'Yesterday': { en: 'Yesterday', he: 'אתמול' },
  'This Week': { en: 'This Week', he: 'השבוע' },
  'Last Week': { en: 'Last Week', he: 'שבוע שעבר' },
  'This Month': { en: 'This Month', he: 'החודש' },
  'Last Month': { en: 'Last Month', he: 'חודש שעבר' },
  'This Year': { en: 'This Year', he: 'השנה' },
  
  // Footer
  'Quick Links': { en: 'Quick Links', he: 'קישורים מהירים' },
  'Customer Service': { en: 'Customer Service', he: 'שירות לקוחות' },
  'Terms of Service': { en: 'Terms of Service', he: 'תנאי שימוש' },
  'Privacy Policy': { en: 'Privacy Policy', he: 'מדיניות פרטיות' },
  'Contact Us': { en: 'Contact Us', he: 'צור קשר' },
  'Follow Us': { en: 'Follow Us', he: 'עקבו אחרינו' },
  'Newsletter': { en: 'Newsletter', he: 'ניוזלטר' },
  'Subscribe': { en: 'Subscribe', he: 'הרשמה' },
  'Enter your email': { en: 'Enter your email', he: 'הכנס את האימייל שלך' },
  
  // Hero Section - Additional
  'Smart Shopping: QR & NFC': { en: 'Smart Shopping: QR & NFC', he: 'קניות חכמות: QR ו-NFC' },
  
  // Special Feed Section
  'Live Marketplace Feed': { en: 'Live Marketplace Feed', he: 'הזנה חיה של השוק' },
  "Today's Special Deals": { en: "Today's Special Deals", he: 'המבצעים המיוחדים של היום' },
  'Fresh promotions from our vendors • Updated every hour': { en: 'Fresh promotions from our vendors • Updated every hour', he: 'מבצעים טריים מהספקים שלנו • מעודכן כל שעה' },
  'Ends in': { en: 'Ends in', he: 'נגמר בעוד' },
  'Quick Add to Cart': { en: 'Quick Add to Cart', he: 'הוספה מהירה לסל' },
  'View Details': { en: 'View Details', he: 'צפה בפרטים' },
  'View All Special Deals': { en: 'View All Special Deals', he: 'צפה בכל המבצעים המיוחדים' },
  
  // Community Services
  'Active Businesses': { en: 'Active Businesses', he: 'עסקים פעילים' },
  'Community Services Hub': { en: 'Community Services Hub', he: 'מרכז שירותי קהילה' },
  'Your gateway to authentic Village of Peace services. From our pioneering vegan food businesses to essential community services, everything you need in one place.': { 
    en: 'Your gateway to authentic Village of Peace services. From our pioneering vegan food businesses to essential community services, everything you need in one place.',
    he: 'השער שלך לשירותי כפר השלום האותנטיים. מעסקי המזון הטבעוני החלוצים שלנו ועד לשירותי קהילה חיוניים, כל מה שאתה צריך במקום אחד.'
  },
  'Active': { en: 'Active', he: 'פעיל' },
  'Currently operating': { en: 'Currently operating', he: 'פועל כעת' },
  'Coming': { en: 'Coming', he: 'בקרוב' },
  'Launching shortly': { en: 'Launching shortly', he: 'משיק בקרוב' },
  'Growing daily': { en: 'Growing daily', he: 'גדל מדי יום' },
  'Food & Dining': { en: 'Food & Dining', he: 'מזון ואוכל' },
  'Home Services': { en: 'Home Services', he: 'שירותי בית' },
  'Personal Care': { en: 'Personal Care', he: 'טיפוח אישי' },
  'Professional': { en: 'Professional', he: 'מקצועי' },
  'Join Our Shop': { en: 'Join Our Shop', he: 'הצטרף לחנות שלנו' },
  'Join as Vendor': { en: 'Join as Vendor', he: 'הצטרף כספק' },
  'Learn More': { en: 'Learn More', he: 'למד עוד' },
  
  // Additional Community Services
  'Grow your business with us': { en: 'Grow your business with us', he: 'הגדל את העסק שלך איתנו' },
  'Service providers and new businesses welcome! Connect with thousands of customers seeking quality services.': { 
    en: 'Service providers and new businesses welcome! Connect with thousands of customers seeking quality services.',
    he: 'ספקי שירותים ועסקים חדשים מוזמנים! התחברו לאלפי לקוחות המחפשים שירותי איכות.'
  },
  'Trusted Platform': { en: 'Trusted Platform', he: 'פלטפורמה מהימנה' },
  '5000+ Customers': { en: '5000+ Customers', he: '5000+ לקוחות' },
  '100% Vegan': { en: '100% Vegan', he: '100% טבעוני' },
  'Soon': { en: 'Soon', he: 'בקרוב' },
  'active': { en: 'active', he: 'פעיל' },
  'coming soon': { en: 'coming soon', he: 'בקרוב' },
  
  // Additional SpecialFeedSection
  'Save': { en: 'Save', he: 'שמור' },
  
  // CustomerCTA translations
  'Personal QR Code': { en: 'Personal QR Code', he: 'קוד QR אישי' },
  'Quick checkout & loyalty tracking': { en: 'Quick checkout & loyalty tracking', he: 'תשלום מהיר ומעקב נאמנות' },
  'Voice Shopping': { en: 'Voice Shopping', he: 'קניות קוליות' },
  'Order in your preferred language': { en: 'Order in your preferred language', he: 'הזמן בשפה המועדפת עליך' },
  'Earn Rewards': { en: 'Earn Rewards', he: 'צבור פרסים' },
  'Get points on every purchase': { en: 'Get points on every purchase', he: 'קבל נקודות על כל רכישה' },
  'AI Assistant': { en: 'AI Assistant', he: 'עוזר AI' },
  'Personalized recommendations': { en: 'Personalized recommendations', he: 'המלצות מותאמות אישית' },
  'New Customer Experience': { en: 'New Customer Experience', he: 'חוויית לקוח חדשה' },
  'Shop Smarter with': { en: 'Shop Smarter with', he: 'קנה חכם יותר עם' },
  'AI-Powered Features': { en: 'AI-Powered Features', he: 'תכונות מופעלות בינה מלאכותית' },
  'Join KFAR marketplace and experience the future of community shopping with personalized QR codes, voice commands, rewards, and AI recommendations.': { 
    en: 'Join KFAR marketplace and experience the future of community shopping with personalized QR codes, voice commands, rewards, and AI recommendations.',
    he: 'הצטרף לשוק כפר וחווה את עתיד הקניות הקהילתיות עם קודי QR אישיים, פקודות קוליות, פרסים והמלצות בינה מלאכותית.'
  },
  'Get Your QR Code': { en: 'Get Your QR Code', he: 'קבל את קוד ה-QR שלך' },
  'Your unique shopping identity': { en: 'Your unique shopping identity', he: 'זהות הקניות הייחודית שלך' },
  'Welcome Bonus': { en: 'Welcome Bonus', he: 'בונוס קבלת פנים' },
  'Points': { en: 'Points', he: 'נקודות' },
  'Bronze Member': { en: 'Bronze Member', he: 'חבר ברונזה' },
  'AI Enhanced': { en: 'AI Enhanced', he: 'משופר AI' },
  'New!': { en: 'New!', he: 'חדש!' },
  'Loyalty Tiers': { en: 'Loyalty Tiers', he: 'רמות נאמנות' },
  'Points per Review': { en: 'Points per Review', he: 'נקודות לביקורת' },
  'Languages': { en: 'Languages', he: 'שפות' },
  'AI Support': { en: 'AI Support', he: 'תמיכת AI' },
  
  // VendorCTA translations
  'Digital Storefront': { en: 'Digital Storefront', he: 'חנות דיגיטלית' },
  'Professional online presence': { en: 'Professional online presence', he: 'נוכחות מקצועית באינטרנט' },
  'Analytics Dashboard': { en: 'Analytics Dashboard', he: 'לוח ניתוח נתונים' },
  'Track sales & customer insights': { en: 'Track sales & customer insights', he: 'עקוב אחר מכירות ותובנות לקוחות' },
  'Secure Payments': { en: 'Secure Payments', he: 'תשלומים מאובטחים' },
  'QR & traditional checkout': { en: 'QR & traditional checkout', he: 'תשלום QR ומסורתי' },
  'Multi-Language': { en: 'Multi-Language', he: 'רב-שפתי' },
  'Reach diverse customers': { en: 'Reach diverse customers', he: 'הגיעו ללקוחות מגוונים' },
  "Today's Performance": { en: "Today's Performance", he: 'הביצועים של היום' },
  'Revenue': { en: 'Revenue', he: 'הכנסות' },
  'Rating': { en: 'Rating', he: 'דירוג' },
  '6 Professional Banner Templates': { en: '6 Professional Banner Templates', he: '6 תבניות באנר מקצועיות' },
  'Success!': { en: 'Success!', he: 'הצלחה!' },
  'Vendor Opportunity': { en: 'Vendor Opportunity', he: 'הזדמנות לספקים' },
  'Grow Your Business with': { en: 'Grow Your Business with', he: 'הגדל את העסק שלך עם' },
  'KFAR Marketplace': { en: 'KFAR Marketplace', he: 'שוק כפר' },
  "Join Village of Peace's digital transformation. Get professional tools, analytics, and multi-channel sales to reach more customers and grow revenue.": { 
    en: "Join Village of Peace's digital transformation. Get professional tools, analytics, and multi-channel sales to reach more customers and grow revenue.",
    he: 'הצטרף לטרנספורמציה הדיגיטלית של כפר השלום. קבל כלים מקצועיים, ניתוח נתונים ומכירות רב-ערוציות כדי להגיע ליותר לקוחות ולהגדיל הכנסות.'
  },
  'Start Selling Today': { en: 'Start Selling Today', he: 'התחל למכור היום' },
  'View Demo': { en: 'View Demo', he: 'צפה בהדגמה' },
  'Setup Fees': { en: 'Setup Fees', he: 'עמלות הקמה' },
  'Banner Templates': { en: 'Banner Templates', he: 'תבניות באנר' },
  'Support': { en: 'Support', he: 'תמיכה' },
  'Payment Methods': { en: 'Payment Methods', he: 'אמצעי תשלום' },
  
  // VillageEnterprises translations
  'The Founding Six': { en: 'The Founding Six', he: 'ששת המייסדים' },
  'Village Enterprises': { en: 'Village Enterprises', he: 'עסקי הכפר' },
  'These pioneering businesses established the foundation of Village of Peace commerce, each carrying decades of heritage and community values into the future.': {
    en: 'These pioneering businesses established the foundation of Village of Peace commerce, each carrying decades of heritage and community values into the future.',
    he: 'עסקים חלוציים אלה הקימו את היסוד למסחר של כפר השלום, כל אחד נושא עשרות שנים של מורשת וערכי קהילה לעתיד.'
  },
  'Est.': { en: 'Est.', he: 'נוסד' },
  'Specialty': { en: 'Specialty', he: 'התמחות' },
  'Shop': { en: 'Shop', he: 'קנה' },
  'Products': { en: 'Products', he: 'מוצרים' },
  
  // Enterprise taglines and descriptions
  'The Original Vegan Factory': { en: 'The Original Vegan Factory', he: 'המפעל הטבעוני המקורי' },
  'Plant-Based Manufacturing': { en: 'Plant-Based Manufacturing', he: 'ייצור מבוסס צמחים' },
  'Seitan & Tofu Products': { en: 'Seitan & Tofu Products', he: 'מוצרי סייטן וטופו' },
  'Pioneering vegan food manufacturing since 1983, bringing plant-based alternatives to Israeli tables nationwide.': {
    en: 'Pioneering vegan food manufacturing since 1983, bringing plant-based alternatives to Israeli tables nationwide.',
    he: 'חלוצי ייצור מזון טבעוני מאז 1983, מביאים חלופות צמחיות לשולחנות ישראליים ברחבי הארץ.'
  },
  'Art of Vegan Catering': { en: 'Art of Vegan Catering', he: 'אמנות הקייטרינג הטבעוני' },
  'Gourmet Catering & Events': { en: 'Gourmet Catering & Events', he: 'קייטרינג גורמה ואירועים' },
  'Premium Event Catering': { en: 'Premium Event Catering', he: 'קייטרינג פרימיום לאירועים' },
  'Elevating plant-based cuisine to an art form for celebrations, events, and special occasions.': {
    en: 'Elevating plant-based cuisine to an art form for celebrations, events, and special occasions.',
    he: 'מרימים את המטבח הצמחי לרמת אמנות לחגיגות, אירועים ואירועים מיוחדים.'
  },
  'Premium Vegan Delicacies': { en: 'Premium Vegan Delicacies', he: 'מעדנים טבעוניים פרימיום' },
  'Artisan Chocolates & Spreads': { en: 'Artisan Chocolates & Spreads', he: 'שוקולדים וממרחים אומנותיים' },
  'Handcrafted Confections': { en: 'Handcrafted Confections', he: 'ממתקים בעבודת יד' },
  'Family-made premium vegan chocolates and spreads, continuing Edenic traditions with modern flair.': {
    en: 'Family-made premium vegan chocolates and spreads, continuing Edenic traditions with modern flair.',
    he: 'שוקולדים וממרחים טבעוניים פרימיום מתוצרת משפחתית, ממשיכים מסורות עדניות עם נגיעה מודרנית.'
  },
  'Artisanal Ice Cream Dreams': { en: 'Artisanal Ice Cream Dreams', he: 'חלומות גלידה אומנותיים' },
  'Frozen Desserts': { en: 'Frozen Desserts', he: 'קינוחים קפואים' },
  'Exotic Vegan Ice Cream': { en: 'Exotic Vegan Ice Cream', he: 'גלידה טבעונית אקזוטית' },
  'Handcrafted vegan ice cream with exotic Middle Eastern flavors and premium ingredients.': {
    en: 'Handcrafted vegan ice cream with exotic Middle Eastern flavors and premium ingredients.',
    he: 'גלידה טבעונית בעבודת יד עם טעמים אקזוטיים מזרח תיכוניים ורכיבים פרימיום.'
  },
  'Your Community Market': { en: 'Your Community Market', he: 'השוק הקהילתי שלך' },
  'International Foods & Bulk': { en: 'International Foods & Bulk', he: 'מזון בינלאומי ובתפזורת' },
  'Specialty Imports': { en: 'Specialty Imports', he: 'יבוא מיוחד' },
  'Your source for specialty foods, bulk ingredients, and hard-to-find international products.': {
    en: 'Your source for specialty foods, bulk ingredients, and hard-to-find international products.',
    he: 'המקור שלך למזונות מיוחדים, רכיבים בתפזורת ומוצרים בינלאומיים קשים להשגה.'
  },
  'Heritage & Wellness Hub': { en: 'Heritage & Wellness Hub', he: 'מרכז מורשת ובריאות' },
  'Community Products': { en: 'Community Products', he: 'מוצרי קהילה' },
  'Cultural & Wellness Items': { en: 'Cultural & Wellness Items', he: 'פריטי תרבות ובריאות' },
  'Celebrating our heritage with cultural products, wellness resources, and community pride.': {
    en: 'Celebrating our heritage with cultural products, wellness resources, and community pride.',
    he: 'חוגגים את המורשת שלנו עם מוצרי תרבות, משאבי בריאות וגאוות קהילה.'
  },
  
  // StatsSection translations
  'Years in Business': { en: 'Years in Business', he: 'שנים בעסקים' },
  'Established 1973': { en: 'Established 1973', he: 'נוסד 1973' },
  'Happy Customers': { en: 'Happy Customers', he: 'לקוחות מרוצים' },
  'Growing Daily': { en: 'Growing Daily', he: 'גדל מדי יום' },
  'Customer Satisfaction': { en: 'Customer Satisfaction', he: 'שביעות רצון לקוחות' },
  'Quality Guaranteed': { en: 'Quality Guaranteed', he: 'איכות מובטחת' },
  'Support Available': { en: 'Support Available', he: 'תמיכה זמינה' },
  'Always Here for You': { en: 'Always Here for You', he: 'תמיד כאן בשבילך' },
  'Same Day': { en: 'Same Day', he: 'באותו יום' },
  'Fast Delivery': { en: 'Fast Delivery', he: 'משלוח מהיר' },
  'Local Orders Before 2PM': { en: 'Local Orders Before 2PM', he: 'הזמנות מקומיות לפני 14:00' },
  'Secure Payment': { en: 'Secure Payment', he: 'תשלום מאובטח' },
  'SSL Encrypted Checkout': { en: 'SSL Encrypted Checkout', he: 'קופה מוצפנת SSL' },
  'Trusted Vendors': { en: 'Trusted Vendors', he: 'ספקים מהימנים' },
  'Quality Verified Partners': { en: 'Quality Verified Partners', he: 'שותפים מאומתי איכות' },
  'Voice': { en: 'Voice', he: 'קול' },
  'Shopping Available': { en: 'Shopping Available', he: 'קניות זמינות' },
  'Order Hands-Free': { en: 'Order Hands-Free', he: 'הזמן ללא ידיים' },
  'First Store Opens': { en: 'First Store Opens', he: 'החנות הראשונה נפתחת' },
  'Community marketplace begins': { en: 'Community marketplace begins', he: 'השוק הקהילתי מתחיל' },
  'Manufacturing Starts': { en: 'Manufacturing Starts', he: 'הייצור מתחיל' },
  'Teva Deli plant-based foods': { en: 'Teva Deli plant-based foods', he: 'מזון צמחי של טבע דלי' },
  'Online Expansion': { en: 'Online Expansion', he: 'התרחבות מקוונת' },
  'Digital marketplace launches': { en: 'Digital marketplace launches', he: 'השוק הדיגיטלי מושק' },
  'Voice Commerce': { en: 'Voice Commerce', he: 'מסחר קולי' },
  'AI-powered shopping arrives': { en: 'AI-powered shopping arrives', he: 'קניות מופעלות בינה מלאכותית מגיעות' },
  'Impact & Heritage': { en: 'Impact & Heritage', he: 'השפעה ומורשת' },
  'Trusted by Thousands': { en: 'Trusted by Thousands', he: 'אמון של אלפים' },
  'Your one-stop marketplace for authentic products, fast delivery, and exceptional customer service powered by cutting-edge technology.': {
    en: 'Your one-stop marketplace for authentic products, fast delivery, and exceptional customer service powered by cutting-edge technology.',
    he: 'השוק המרכזי שלך למוצרים אותנטיים, משלוח מהיר ושירות לקוחות יוצא דופן המופעל בטכנולוגיה מתקדמת.'
  },
  'Why Shop With Us': { en: 'Why Shop With Us', he: 'למה לקנות אצלנו' },
  'Our Journey': { en: 'Our Journey', he: 'המסע שלנו' },
  'Experience the future of shopping with voice commerce and same-day delivery': { 
    en: 'Experience the future of shopping with voice commerce and same-day delivery',
    he: 'חווה את עתיד הקניות עם מסחר קולי ומשלוח באותו יום'
  },
  'Start Shopping Now': { en: 'Start Shopping Now', he: 'התחל לקנות עכשיו' },

  // Landing Page - New Sections
  'Shop Now': { en: 'Shop Now', he: 'קנה עכשיו' },
  'Explore Vendors': { en: 'Explore Vendors', he: 'חקור ספקים' },
  'Become a Driver': { en: 'Become a Driver', he: 'הפוך לנהג' },
  'Flash Deals': { en: 'Flash Deals', he: 'מבצעי בזק' },
  'Bundle & Save': { en: 'Bundle & Save', he: 'חבילה וחסוך' },
  'Ends in': { en: 'Ends in', he: 'נגמר בעוד' },
  'Buy Now': { en: 'Buy Now', he: 'קנה עכשיו' },
  'Add Bundle to Cart': { en: 'Add Bundle to Cart', he: 'הוסף חבילה לסל' },
  'Visit Store': { en: 'Visit Store', he: 'בקר בחנות' },
  'Same-Day Delivery': { en: 'Same-Day Delivery', he: 'משלוח באותו יום' },
  'Free Delivery': { en: 'Free Delivery', he: 'משלוח חינם' },
  'Loyalty Points': { en: 'Loyalty Points', he: 'נקודות נאמנות' },
  'QR Code Shopping': { en: 'QR Code Shopping', he: 'קניות עם QR' },
  'Delivery': { en: 'Delivery', he: 'משלוח' },
  'Pickup': { en: 'Pickup', he: 'איסוף עצמי' },
  '50+ Years Heritage': { en: '50+ Years Heritage', he: '50+ שנות מורשת' },
  '100% Plant-Based': { en: '100% Plant-Based', he: '100% צמחי' },
  'Welcome Gift': { en: 'Welcome Gift', he: 'מתנת ברוכים הבאים' },
  'First 100 members get a welcome gift': { en: 'First 100 members get a welcome gift', he: '100 החברים הראשונים מקבלים מתנת הצטרפות' },
  'First Purchase Reward': { en: 'First Purchase Reward', he: 'פרס רכישה ראשונה' },
  'Get 50 bonus points on your first order': { en: 'Get 50 bonus points on your first order', he: 'קבל 50 נקודות בונוס בהזמנה הראשונה' },
  'Founding Members Earn Double Points': { en: 'Founding Members Earn Double Points', he: 'חברים מייסדים מרוויחים נקודות כפולות' },
  'Earn 2x points on bundles': { en: 'Earn 2x points on bundles', he: 'צבור נקודות כפולות על חבילות' },
  'Popular This Week': { en: 'Popular This Week', he: 'פופולרי השבוע' },
  'families': { en: 'families', he: 'משפחות' },
  'years': { en: 'years', he: 'שנים' },
  'Your Community Marketplace': { en: 'Your Community Marketplace', he: 'השוק הקהילתי שלכם' },
  'Join the digital revolution': { en: 'Join the digital revolution', he: 'הצטרפו למהפכה הדיגיטלית' },
  'Save': { en: 'Save', he: 'חסוך' },
  'Stock running low': { en: 'Stock running low', he: 'המלאי אוזל' },
  'left': { en: 'left', he: 'נותרו' },
  'Sold out': { en: 'Sold out', he: 'אזל' },
  'Subscribe to Newsletter': { en: 'Subscribe to Newsletter', he: 'הרשמו לניוזלטר' },
  'Get updates on deals and new products': { en: 'Get updates on deals and new products', he: 'קבלו עדכונים על מבצעים ומוצרים חדשים' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'he'>('en');
  const { translate } = useTranslation();

  useEffect(() => {
    // Load language preference
    const savedLang = localStorage.getItem('kfar-language') as 'en' | 'he';
    if (savedLang) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'he' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: 'en' | 'he') => {
    setLanguageState(lang);
    localStorage.setItem('kfar-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    setLanguage(newLang);
  };

  const t = (text: string, context?: 'store_name' | 'product_name' | 'description'): string => {
    // If English, return as-is
    if (language === 'en') return text;
    
    // Check common translations first
    if (commonTranslations[text]) {
      return commonTranslations[text][language];
    }
    
    // For dynamic content, use translation API
    // Note: This is async, so we'll need to handle it differently
    // For now, return the original text
    return text;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isRTL: language === 'he',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}