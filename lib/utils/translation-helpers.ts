import { TranslationRequest } from '@/lib/types/translation';

/**
 * Helper functions for common translation patterns in the marketplace
 */

/**
 * Translate a vendor/store object
 */
export async function translateVendor(
  vendor: { name: string; description?: string },
  targetLang: 'he' | 'en',
  translateFn: (text: string, lang: 'he' | 'en', context?: TranslationRequest['context']) => Promise<string>
) {
  const [translatedName, translatedDescription] = await Promise.all([
    translateFn(vendor.name, targetLang, 'store_name'),
    vendor.description 
      ? translateFn(vendor.description, targetLang, 'description')
      : Promise.resolve('')
  ]);

  return {
    ...vendor,
    name: translatedName,
    description: translatedDescription || vendor.description
  };
}

/**
 * Translate a product object
 */
export async function translateProduct(
  product: { 
    name: string; 
    description?: string;
    category?: string;
  },
  targetLang: 'he' | 'en',
  translateFn: (text: string, lang: 'he' | 'en', context?: TranslationRequest['context']) => Promise<string>
) {
  const [translatedName, translatedDescription, translatedCategory] = await Promise.all([
    translateFn(product.name, targetLang, 'product_name'),
    product.description 
      ? translateFn(product.description, targetLang, 'description')
      : Promise.resolve(''),
    product.category
      ? translateFn(product.category, targetLang, 'product_name')
      : Promise.resolve('')
  ]);

  return {
    ...product,
    name: translatedName,
    description: translatedDescription || product.description,
    category: translatedCategory || product.category
  };
}

/**
 * Translate an array of products efficiently
 */
export async function translateProducts(
  products: Array<{ name: string; description?: string; category?: string }>,
  targetLang: 'he' | 'en',
  translateFn: (text: string, lang: 'he' | 'en', context?: TranslationRequest['context']) => Promise<string>
) {
  return Promise.all(
    products.map(product => translateProduct(product, targetLang, translateFn))
  );
}

/**
 * Get the current language from browser or default
 */
export function getPreferredLanguage(): 'he' | 'en' {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const stored = localStorage.getItem('preferredLanguage');
  if (stored === 'he' || stored === 'en') return stored;
  
  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('he')) return 'he';
  
  return 'en';
}

/**
 * Save preferred language
 */
export function setPreferredLanguage(lang: 'he' | 'en') {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLanguage', lang);
  }
}

/**
 * Common Hebrew translations for marketplace terms
 */
export const commonTranslations = {
  en: {
    'Add to Cart': 'Add to Cart',
    'View Details': 'View Details',
    'In Stock': 'In Stock',
    'Out of Stock': 'Out of Stock',
    'Price': 'Price',
    'Quantity': 'Quantity',
    'Total': 'Total',
    'Checkout': 'Checkout',
    'Cart': 'Cart',
    'Search': 'Search',
    'Categories': 'Categories',
    'Vendors': 'Vendors',
    'Products': 'Products',
    'Home': 'Home',
    'About': 'About',
    'Contact': 'Contact'
  },
  he: {
    'Add to Cart': 'הוסף לעגלה',
    'View Details': 'צפה בפרטים',
    'In Stock': 'במלאי',
    'Out of Stock': 'אזל המלאי',
    'Price': 'מחיר',
    'Quantity': 'כמות',
    'Total': 'סה״כ',
    'Checkout': 'לקופה',
    'Cart': 'עגלה',
    'Search': 'חיפוש',
    'Categories': 'קטגוריות',
    'Vendors': 'ספקים',
    'Products': 'מוצרים',
    'Home': 'בית',
    'About': 'אודות',
    'Contact': 'צור קשר'
  }
};

/**
 * Get a common translation without API call
 */
export function getCommonTranslation(
  key: keyof typeof commonTranslations.en,
  lang: 'he' | 'en'
): string {
  return commonTranslations[lang][key] || key;
}