// Portal Translation Dictionary
// Used via useLanguage() hook's t() function across all portal pages

export const portalTranslations: Record<string, Record<'en' | 'he', string>> = {
  // Sidebar Navigation - Admin
  'Dashboard': { en: 'Dashboard', he: 'לוח בקרה' },
  'Vendors': { en: 'Vendors', he: 'ספקים' },
  'Bundles': { en: 'Bundles', he: 'חבילות' },
  'Orders': { en: 'Orders', he: 'הזמנות' },
  'Accounts': { en: 'Accounts', he: 'חשבונות' },
  'Promotions': { en: 'Promotions', he: 'מבצעים' },
  'Settings': { en: 'Settings', he: 'הגדרות' },
  'Products': { en: 'Products', he: 'מוצרים' },
  'Analytics': { en: 'Analytics', he: 'ניתוח נתונים' },
  'QR Codes': { en: 'QR Codes', he: 'קודי QR' },
  'Marketing': { en: 'Marketing', he: 'שיווק' },
  'Rewards': { en: 'Rewards', he: 'פרסים' },
  'Profile': { en: 'Profile', he: 'פרופיל' },
  'My Orders': { en: 'My Orders', he: 'ההזמנות שלי' },
  'My Rewards': { en: 'My Rewards', he: 'הפרסים שלי' },
  'Favorites': { en: 'Favorites', he: 'מועדפים' },

  // Portal Headers
  'Admin Panel': { en: 'Admin Panel', he: 'פאנל ניהול' },
  'Vendor Portal': { en: 'Vendor Portal', he: 'פורטל ספקים' },
  'Customer Portal': { en: 'Customer Portal', he: 'פורטל לקוחות' },
  'Marketplace Control': { en: 'Marketplace Control', he: 'ניהול שוק' },
  'Store Management': { en: 'Store Management', he: 'ניהול חנות' },
  'Your Account': { en: 'Your Account', he: 'החשבון שלך' },
  'KFAR Admin': { en: 'KFAR Admin', he: 'מנהל כפר' },
  'Back to Marketplace': { en: 'Back to Marketplace', he: 'חזרה לשוק' },
  'View Marketplace': { en: 'View Marketplace', he: 'צפה בשוק' },

  // Common Actions
  'Add New': { en: 'Add New', he: 'הוסף חדש' },
  'Create': { en: 'Create', he: 'צור' },
  'Edit': { en: 'Edit', he: 'ערוך' },
  'Delete': { en: 'Delete', he: 'מחק' },
  'Save': { en: 'Save', he: 'שמור' },
  'Save Changes': { en: 'Save Changes', he: 'שמור שינויים' },
  'Cancel': { en: 'Cancel', he: 'ביטול' },
  'Confirm': { en: 'Confirm', he: 'אישור' },
  'Close': { en: 'Close', he: 'סגור' },
  'Search': { en: 'Search', he: 'חיפוש' },
  'Filter': { en: 'Filter', he: 'סינון' },
  'Export': { en: 'Export', he: 'ייצוא' },
  'Import': { en: 'Import', he: 'ייבוא' },
  'Refresh': { en: 'Refresh', he: 'רענון' },
  'View All': { en: 'View All', he: 'צפה בהכל' },
  'View Details': { en: 'View Details', he: 'צפה בפרטים' },
  'Manage': { en: 'Manage', he: 'נהל' },
  'Update': { en: 'Update', he: 'עדכן' },
  'Submit': { en: 'Submit', he: 'שלח' },
  'Apply': { en: 'Apply', he: 'החל' },
  'Reset': { en: 'Reset', he: 'אפס' },
  'Clear': { en: 'Clear', he: 'נקה' },
  'Logout': { en: 'Logout', he: 'התנתקות' },
  'Log Out': { en: 'Log Out', he: 'התנתקות' },

  // Stats & Metrics
  'Total Revenue': { en: 'Total Revenue', he: 'הכנסות כוללות' },
  'Active Orders': { en: 'Active Orders', he: 'הזמנות פעילות' },
  'Active Vendors': { en: 'Active Vendors', he: 'ספקים פעילים' },
  'Active Customers': { en: 'Active Customers', he: 'לקוחות פעילים' },
  'Total Products': { en: 'Total Products', he: 'סה"כ מוצרים' },
  'Orders Today': { en: 'Orders Today', he: 'הזמנות היום' },
  'Revenue This Month': { en: 'Revenue This Month', he: 'הכנסות החודש' },
  'Rating': { en: 'Rating', he: 'דירוג' },
  'Total Orders': { en: 'Total Orders', he: 'סה"כ הזמנות' },
  'Rewards Points': { en: 'Rewards Points', he: 'נקודות פרסים' },
  'Total Savings': { en: 'Total Savings', he: 'סה"כ חיסכון' },
  'Favourite Vendor': { en: 'Favourite Vendor', he: 'ספק מועדף' },
  'This Month': { en: 'This Month', he: 'החודש' },
  'Last Month': { en: 'Last Month', he: 'חודש שעבר' },
  'This Week': { en: 'This Week', he: 'השבוע' },
  'vs last month': { en: 'vs last month', he: 'לעומת חודש שעבר' },
  'vs last week': { en: 'vs last week', he: 'לעומת שבוע שעבר' },

  // Order Statuses
  'Pending': { en: 'Pending', he: 'ממתין' },
  'Processing': { en: 'Processing', he: 'בעיבוד' },
  'Shipped': { en: 'Shipped', he: 'נשלח' },
  'Delivered': { en: 'Delivered', he: 'נמסר' },
  'Cancelled': { en: 'Cancelled', he: 'בוטל' },
  'Refunded': { en: 'Refunded', he: 'הוחזר' },
  'Completed': { en: 'Completed', he: 'הושלם' },
  'Active': { en: 'Active', he: 'פעיל' },
  'Draft': { en: 'Draft', he: 'טיוטה' },
  'Inactive': { en: 'Inactive', he: 'לא פעיל' },

  // Table Headers
  'Order ID': { en: 'Order ID', he: 'מזהה הזמנה' },
  'Customer': { en: 'Customer', he: 'לקוח' },
  'Date': { en: 'Date', he: 'תאריך' },
  'Status': { en: 'Status', he: 'סטטוס' },
  'Amount': { en: 'Amount', he: 'סכום' },
  'Actions': { en: 'Actions', he: 'פעולות' },
  'Product Name': { en: 'Product Name', he: 'שם המוצר' },
  'Price': { en: 'Price', he: 'מחיר' },
  'Stock': { en: 'Stock', he: 'מלאי' },
  'Vendor': { en: 'Vendor', he: 'ספק' },
  'Category': { en: 'Category', he: 'קטגוריה' },
  'Email': { en: 'Email', he: 'אימייל' },
  'Phone': { en: 'Phone', he: 'טלפון' },
  'Name': { en: 'Name', he: 'שם' },
  'Store Name': { en: 'Store Name', he: 'שם החנות' },
  'Items': { en: 'Items', he: 'פריטים' },
  'Total': { en: 'Total', he: 'סה"כ' },

  // Quick Actions
  'Quick Actions': { en: 'Quick Actions', he: 'פעולות מהירות' },
  'Manage Bundles': { en: 'Manage Bundles', he: 'נהל חבילות' },
  'View Vendors': { en: 'View Vendors', he: 'צפה בספקים' },
  'Recent Orders': { en: 'Recent Orders', he: 'הזמנות אחרונות' },
  'Add Product': { en: 'Add Product', he: 'הוסף מוצר' },
  'View Orders': { en: 'View Orders', he: 'צפה בהזמנות' },
  'Browse Shop': { en: 'Browse Shop', he: 'גלוש בחנות' },
  'Track Order': { en: 'Track Order', he: 'עקוב אחר הזמנה' },
  'My Profile': { en: 'My Profile', he: 'הפרופיל שלי' },

  // Bundles
  'Create Bundle': { en: 'Create Bundle', he: 'צור חבילה' },
  'Edit Bundle': { en: 'Edit Bundle', he: 'ערוך חבילה' },
  'Bundle Name': { en: 'Bundle Name', he: 'שם החבילה' },
  'Bundle Price': { en: 'Bundle Price', he: 'מחיר החבילה' },
  'Bundle Products': { en: 'Bundle Products', he: 'מוצרי החבילה' },
  'You Save': { en: 'You Save', he: 'אתה חוסך' },
  'Add Products': { en: 'Add Products', he: 'הוסף מוצרים' },
  'Select Products': { en: 'Select Products', he: 'בחר מוצרים' },

  // Forms & Fields
  'Full Name': { en: 'Full Name', he: 'שם מלא' },
  'Email Address': { en: 'Email Address', he: 'כתובת אימייל' },
  'Password': { en: 'Password', he: 'סיסמה' },
  'Confirm Password': { en: 'Confirm Password', he: 'אשר סיסמה' },
  'Phone Number': { en: 'Phone Number', he: 'מספר טלפון' },
  'Address': { en: 'Address', he: 'כתובת' },
  'City': { en: 'City', he: 'עיר' },
  'Required': { en: 'Required', he: 'שדה חובה' },
  'Optional': { en: 'Optional', he: 'אופציונלי' },

  // Login/Auth
  'Login': { en: 'Login', he: 'התחברות' },
  'Sign In': { en: 'Sign In', he: 'התחבר' },
  'Sign Out': { en: 'Sign Out', he: 'התנתק' },
  'Welcome Back': { en: 'Welcome Back', he: 'ברוכים השבים' },
  'Enter your credentials': { en: 'Enter your credentials', he: 'הזן את פרטי ההתחברות' },
  'Vendor ID': { en: 'Vendor ID', he: 'מזהה ספק' },
  'Admin Password': { en: 'Admin Password', he: 'סיסמת מנהל' },
  'Remember me': { en: 'Remember me', he: 'זכור אותי' },
  'Invalid credentials': { en: 'Invalid credentials', he: 'פרטים שגויים' },
  'Signing in...': { en: 'Signing in...', he: 'מתחבר...' },

  // Empty States
  'No data available': { en: 'No data available', he: 'אין נתונים זמינים' },
  'No orders yet': { en: 'No orders yet', he: 'אין הזמנות עדיין' },
  'No products found': { en: 'No products found', he: 'לא נמצאו מוצרים' },
  'No results found': { en: 'No results found', he: 'לא נמצאו תוצאות' },
  'Start by creating your first': { en: 'Start by creating your first', he: 'התחל ביצירת' },

  // Confirmation
  'Are you sure?': { en: 'Are you sure?', he: 'האם אתה בטוח?' },
  'This action cannot be undone': { en: 'This action cannot be undone', he: 'לא ניתן לבטל פעולה זו' },
  'Delete this item?': { en: 'Delete this item?', he: 'למחוק פריט זה?' },
  'Confirm Action': { en: 'Confirm Action', he: 'אשר פעולה' },

  // Settings
  'Marketplace Settings': { en: 'Marketplace Settings', he: 'הגדרות שוק' },
  'Marketplace Name': { en: 'Marketplace Name', he: 'שם השוק' },
  'Currency': { en: 'Currency', he: 'מטבע' },
  'Tax Rate': { en: 'Tax Rate', he: 'שיעור מס' },
  'Notification Settings': { en: 'Notification Settings', he: 'הגדרות התראות' },
  'WhatsApp Notifications': { en: 'WhatsApp Notifications', he: 'התראות וואטסאפ' },
  'Email Notifications': { en: 'Email Notifications', he: 'התראות אימייל' },
  'Change Password': { en: 'Change Password', he: 'שנה סיסמה' },
  'Current Password': { en: 'Current Password', he: 'סיסמה נוכחית' },
  'New Password': { en: 'New Password', he: 'סיסמה חדשה' },
  'Language Preference': { en: 'Language Preference', he: 'העדפת שפה' },
  'General': { en: 'General', he: 'כללי' },
  'Notifications': { en: 'Notifications', he: 'התראות' },
  'Security': { en: 'Security', he: 'אבטחה' },

  // Pagination
  'Previous': { en: 'Previous', he: 'הקודם' },
  'Next': { en: 'Next', he: 'הבא' },
  'Page': { en: 'Page', he: 'עמוד' },
  'of': { en: 'of', he: 'מתוך' },
  'Showing': { en: 'Showing', he: 'מציג' },
  'entries': { en: 'entries', he: 'רשומות' },
  'per page': { en: 'per page', he: 'לעמוד' },

  // Loading & Errors
  'Loading...': { en: 'Loading...', he: 'טוען...' },
  'Error loading data': { en: 'Error loading data', he: 'שגיאה בטעינת נתונים' },
  'Something went wrong': { en: 'Something went wrong', he: 'משהו השתבש' },
  'Try again': { en: 'Try again', he: 'נסה שוב' },
  'Saving...': { en: 'Saving...', he: 'שומר...' },
  'Saved successfully': { en: 'Saved successfully', he: 'נשמר בהצלחה' },

  // Rewards & Loyalty
  'Points Balance': { en: 'Points Balance', he: 'יתרת נקודות' },
  'Points History': { en: 'Points History', he: 'היסטוריית נקודות' },
  'Reward Tiers': { en: 'Reward Tiers', he: 'רמות פרס' },
  'Bronze': { en: 'Bronze', he: 'ארד' },
  'Silver': { en: 'Silver', he: 'כסף' },
  'Gold': { en: 'Gold', he: 'זהב' },
  'Platinum': { en: 'Platinum', he: 'פלטינה' },
  'Earned': { en: 'Earned', he: 'נצבר' },
  'Redeemed': { en: 'Redeemed', he: 'מומש' },
  'Available Points': { en: 'Available Points', he: 'נקודות זמינות' },

  // Tabs
  'Customers': { en: 'Customers', he: 'לקוחות' },
  'Admins': { en: 'Admins', he: 'מנהלים' },
  'All': { en: 'All', he: 'הכל' },
  'Overview': { en: 'Overview', he: 'סקירה' },
  'Details': { en: 'Details', he: 'פרטים' },

  // Misc
  'Welcome': { en: 'Welcome', he: 'ברוכים הבאים' },
  'Hello': { en: 'Hello', he: 'שלום' },
  'Today': { en: 'Today', he: 'היום' },
  'Yesterday': { en: 'Yesterday', he: 'אתמול' },
  'No': { en: 'No', he: 'לא' },
  'Yes': { en: 'Yes', he: 'כן' },
  'or': { en: 'or', he: 'או' },
  'and': { en: 'and', he: 'ו' },
  'item': { en: 'item', he: 'פריט' },
  'items': { en: 'items', he: 'פריטים' },
  'more': { en: 'more', he: 'עוד' },
  'less': { en: 'less', he: 'פחות' },
};

// Helper to register portal translations into the LanguageContext
// Call this once at app init or import translations directly
export function getPortalTranslation(key: string, language: 'en' | 'he'): string {
  const entry = portalTranslations[key];
  if (entry) return entry[language];
  return key;
}
