// Utility to add tags to products based on their properties
import { EnhancedProduct } from '../data/complete-catalog';

export function autoTagProduct(product: any): string[] {
  const tags: string[] = [];
  
  // Basic attributes
  if (product.isVegan) tags.push('vegan');
  if (product.isKosher) tags.push('kosher');
  if (product.isOrganic) tags.push('organic');
  if (product.isGlutenFree) tags.push('gluten-free');
  
  // Category-based tags
  const categoryTags: Record<string, string[]> = {
    'meat-alternatives': ['meat-alternative', 'protein-rich', 'plant-based'],
    'prepared-foods': ['ready-to-eat', 'convenient', 'time-saver'],
    'frozen': ['frozen', 'long-shelf-life', 'stock-up'],
    'pantry': ['pantry-staple', 'shelf-stable', 'essential'],
    'beverages': ['beverage', 'refreshing', 'drink'],
    'desserts': ['dessert', 'sweet', 'treat'],
    'deli': ['deli', 'fresh', 'artisan'],
    'baked-goods': ['bakery', 'fresh-baked', 'artisan'],
    'dairy-alternatives': ['dairy-free', 'plant-based', 'alternative'],
    'fresh': ['fresh', 'perishable', 'quality']
  };
  
  if (product.category && categoryTags[product.category]) {
    tags.push(...categoryTags[product.category]);
  }
  
  // Name-based tags
  const nameLower = product.name.toLowerCase();
  if (nameLower.includes('burger')) tags.push('burger');
  if (nameLower.includes('schnitzel')) tags.push('schnitzel');
  if (nameLower.includes('shawarma')) tags.push('shawarma');
  if (nameLower.includes('kebab')) tags.push('kebab');
  if (nameLower.includes('sausage')) tags.push('sausage');
  if (nameLower.includes('salad')) tags.push('salad');
  if (nameLower.includes('soup')) tags.push('soup');
  if (nameLower.includes('ice cream')) tags.push('ice-cream');
  if (nameLower.includes('cheese')) tags.push('cheese-alternative');
  if (nameLower.includes('tofu')) tags.push('tofu', 'soy');
  if (nameLower.includes('seitan')) tags.push('seitan', 'wheat-protein');
  if (nameLower.includes('hummus')) tags.push('hummus', 'chickpea');
  if (nameLower.includes('tahini')) tags.push('tahini', 'sesame');
  if (nameLower.includes('falafel')) tags.push('falafel', 'middle-eastern');
  
  // Badge-based tags
  if (product.badge) {
    const badgeLower = product.badge.toLowerCase();
    if (badgeLower.includes('new')) tags.push('new-arrival');
    if (badgeLower.includes('best')) tags.push('best-seller');
    if (badgeLower.includes('special')) tags.push('special-offer');
    if (badgeLower.includes('limited')) tags.push('limited-edition');
  }
  
  // Price-based tags
  if (product.originalPrice && product.price < product.originalPrice) {
    tags.push('on-sale', 'discount');
  }
  if (product.price < 20) tags.push('budget-friendly');
  if (product.price > 50) tags.push('premium');
  
  // Stock status
  if (product.inStock === false) tags.push('out-of-stock');
  else tags.push('in-stock');
  
  // Vendor-specific tags
  const vendorTags: Record<string, string[]> = {
    'teva-deli': ['local', 'israeli', 'traditional'],
    'queens-cuisine': ['gourmet', 'chef-made', 'artisan'],
    'gahn-delight': ['handmade', 'artisan', 'premium'],
    'people-store': ['community', 'bulk', 'value'],
    'vop-shop': ['heritage', 'cultural', 'authentic'],
    'atur-avior': ['spiritual', 'mindful', 'holistic']
  };
  
  if (product.vendorId && vendorTags[product.vendorId]) {
    tags.push(...vendorTags[product.vendorId]);
  }
  
  // Remove duplicates
  return [...new Set(tags)];
}

// Enhanced product with auto-generated tags
export function enhanceProductWithTags(product: any): EnhancedProduct {
  const autoTags = autoTagProduct(product);
  
  return {
    ...product,
    tags: product.tags || autoTags,
    qrCode: product.qrCode || `QR-${product.id.toUpperCase()}`,
    nfcEnabled: product.nfcEnabled || false,
    sustainabilityScore: product.sustainabilityScore || Math.floor(Math.random() * 3) + 7, // 7-9 score
    allergens: product.allergens || [],
    nutritionalInfo: product.nutritionalInfo || {},
    certifications: product.certifications || (product.isVegan ? ['Vegan Certified'] : []).concat(product.isKosher ? ['Kosher Certified'] : [])
  };
}