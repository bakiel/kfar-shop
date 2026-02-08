// Updated Teva Deli vendor configuration for app integration

export const tevaDeliVendorConfig = {
  id: 'teva-deli',
  businessName: 'Teva Deli',
  businessNameHe: 'טבע דלי',
  description: 'Premium plant-based deli products made with love in Israel. From classic schnitzels to innovative meat alternatives.',
  descriptionHe: 'מוצרי דלי טבעוניים איכותיים מתוצרת ישראל. משניצלים קלאסיים ועד תחליפי בשר חדשניים.',
  logo: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
  bannerImage: '/images/vendors/teva_deli_banner_plant_based_factory.jpg',
  category: 'plant-based-deli',
  rating: 4.7,
  reviewCount: 8234,
  productCount: 46, // Updated from 48 to 46 (removed duplicates)
  deliveryOptions: ['pickup', 'delivery'],
  paymentMethods: ['cash', 'card', 'bit'],
  minimumOrder: 150,
  deliveryFee: 20,
  estimatedDeliveryTime: '1-2 days',
  operatingHours: [
    { day: 'Sunday', open: '08:00', close: '18:00' },
    { day: 'Monday', open: '08:00', close: '18:00' },
    { day: 'Tuesday', open: '08:00', close: '18:00' },
    { day: 'Wednesday', open: '08:00', close: '18:00' },
    { day: 'Thursday', open: '08:00', close: '18:00' },
    { day: 'Friday', open: '08:00', close: '14:00' },
    { day: 'Saturday', closed: true }
  ],
  categories: [
    { id: 'schnitzels', name: 'Schnitzels', nameHe: 'שניצלים', count: 5 },
    { id: 'seitan-tofu', name: 'Seitan & Tofu', nameHe: 'סייטן וטופו', count: 7 },
    { id: 'ready-meals', name: 'Ready Meals', nameHe: 'ארוחות מוכנות', count: 8 },
    { id: 'burgers', name: 'Burgers', nameHe: 'המבורגרים', count: 6 },
    { id: 'sausages', name: 'Sausages', nameHe: 'נקניקיות', count: 4 },
    { id: 'kebabs', name: 'Kebabs', nameHe: 'קבבים', count: 4 },
    { id: 'deli-meats', name: 'Deli Meats', nameHe: 'בשרים קרים', count: 4 },
    { id: 'specialty', name: 'Specialty', nameHe: 'מוצרים מיוחדים', count: 4 },
    { id: 'breakfast', name: 'Breakfast', nameHe: 'ארוחת בוקר', count: 1 },
    { id: 'meal-kits', name: 'Meal Kits', nameHe: 'ערכות ארוחה', count: 1 }
  ],
  features: [
    'Plant-Based',
    'Kosher Certified',
    'Made in Israel',
    'No Preservatives',
    'High Protein'
  ],
  certifications: ['Badatz', 'Vegan Certified'],
  socialMedia: {
    facebook: 'https://facebook.com/tevadeli',
    instagram: 'https://instagram.com/tevadeli'
  },
  contactInfo: {
    phone: '03-123-4567',
    email: 'info@tevadeli.co.il',
    address: 'Industrial Zone, Kiryat Malachi, Israel'
  }
};

export default tevaDeliVendorConfig;
