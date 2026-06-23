/**
 * Search Agent for KFAR AI Shopping Assistant
 * Handles semantic product search with voice corrections
 */

import { getProductById, getProductFeed, ProductFeedProduct } from '@/lib/services/live-product-feed';
import { getVendorFeed } from '@/lib/services/live-vendor-feed';
import { hybridSearch, type EnhancedProduct } from '@/lib/search/semantic-search';
import type { ProductResult, SearchFilters } from '../events/shopping-events';

// Semantic category mappings - what users say vs actual categories
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'desserts': ['ice-cream', 'sorbet', 'parfait', 'popsicles', 'chocolates', 'sweets'],
  'dessert': ['ice-cream', 'sorbet', 'parfait', 'popsicles', 'chocolates', 'sweets'],
  'sweets': ['ice-cream', 'chocolates', 'desserts', 'parfait'],
  'frozen': ['ice-cream', 'sorbet', 'popsicles', 'frozen-desserts'],
  'ice cream': ['ice-cream'],
  'icecream': ['ice-cream'],
  'drinks': ['beverages', 'juices', 'smoothies'],
  'dips': ['spreads', 'hummus', 'tahini'],
  'main dishes': ['meals', 'entrees', 'mains'],
  'entrees': ['meals', 'mains'],
  'proteins': ['seitan', 'tofu', 'tempeh'],
  'meat alternatives': ['seitan', 'tofu', 'tempeh', 'vegan-meat'],
};

// Voice correction mappings for common mishearings
const VOICE_CORRECTIONS: Record<string, string[]> = {
  // Hebrew food terms that may be misheard
  'seitan': ['satan', 'setan', 'saitan', 'say tan', 'sea tan'],
  'tahini': ['tahina', 'tehini', 'tehina', 'ta hini'],
  'shawarma': ['shwarma', 'shawerma', 'shawirma', 'sure ma'],
  'falafel': ['felafel', 'falafl', 'fell awful'],
  'hummus': ['homos', 'humus', 'homus', 'hamos'],
  'schnitzel': ['shnitzel', 'schnitsl', 'schnitzl'],
  'kubbeh': ['kubeh', 'kibbeh', 'kube', 'cube'],
  'tofu': ['toe foo', 'to fu', 'tofoo'],
  'vegan': ['vegen', 'vagan', 'veegan'],
  'kosher': ['koshar', 'kosha', 'casher'],
  'organic': ['organik', 'orgenic'],
  // Vendor names
  'teva deli': ['tiva deli', 'teva delhi', 'teva delly'],
  'garden of light': ['garden of lite', 'garden lite'],
  'queens cuisine': ['queens cousine', 'queen cuisine'],
  'gahn delight': ['gone delight', 'gan delight', 'gahn delite'],
  // Categories
  'spreads': ['spreds', 'spread'],
  'cheeses': ['cheses', 'cheese'],
  'desserts': ['deserts', 'dessert'],
  'beverages': ['beverges', 'beverage'],
  'snacks': ['snaks', 'snack'],
};

export class SearchAgent {
  private normalizeProducts(products: ProductFeedProduct[]): EnhancedProduct[] {
    return products.map(product => ({
      ...product,
      nameHe: product.nameHe || undefined,
      description: product.description || '',
      featured: product.isFeatured,
      isVegan: product.vegan,
      isKosher: Boolean(product.kashrut),
      isOrganic: product.organic,
      isGlutenFree: product.glutenFree,
    }));
  }

  /**
   * Apply voice corrections to search query
   */
  private applyVoiceCorrections(query: string): string {
    let corrected = query.toLowerCase();

    for (const [correct, variants] of Object.entries(VOICE_CORRECTIONS)) {
      for (const variant of variants) {
        // Skip if the query already contains the correct form
        // This prevents "desserts" from being modified when checking "dessert" variant
        const correctRegex = new RegExp(`\\b${correct}\\b`, 'gi');
        if (correctRegex.test(corrected)) {
          continue;
        }

        // Use word boundaries to prevent partial matches
        // Create fresh regex for replacement to avoid lastIndex issues
        const regex = new RegExp(`\\b${variant}\\b`, 'gi');
        corrected = corrected.replace(regex, correct);
      }
    }

    return corrected;
  }

  /**
   * Expand search terms using category synonyms
   */
  private expandSearchTerms(terms: string[]): string[] {
    const expanded = new Set<string>(terms);

    for (const term of terms) {
      // Check single word synonyms
      if (CATEGORY_SYNONYMS[term]) {
        CATEGORY_SYNONYMS[term].forEach(syn => expanded.add(syn));
      }
    }

    // Check multi-word phrases
    const phrase = terms.join(' ');
    if (CATEGORY_SYNONYMS[phrase]) {
      CATEGORY_SYNONYMS[phrase].forEach(syn => expanded.add(syn));
    }

    return Array.from(expanded);
  }

  /**
   * Calculate relevance score for a product against search terms
   */
  private calculateRelevance(product: EnhancedProduct, searchTerms: string[]): number {
    let score = 0;
    const nameL = product.name.toLowerCase();
    const descL = (product.description || '').toLowerCase();
    const categoryL = (product.category || '').toLowerCase();
    const vendorL = (product.vendorName || '').toLowerCase();
    const tagsL = (product.tags || []).map(t => t.toLowerCase());

    for (const term of searchTerms) {
      // Exact name match (highest weight)
      if (nameL.includes(term)) score += 10;
      // Category match
      if (categoryL.includes(term)) score += 7;
      // Vendor match
      if (vendorL.includes(term)) score += 5;
      // Tag match
      if (tagsL.some(t => t.includes(term))) score += 4;
      // Description match
      if (descL.includes(term)) score += 2;
    }

    // Boost featured products
    if (product.featured || product.badge) score += 3;

    // Boost in-stock products
    if (product.inStock !== false) score += 2;

    return score;
  }

  /**
   * Search products with semantic understanding
   * Uses hybridSearch for richer synonym expansion and field-weighted scoring
   */
  async search(query: string, filters?: SearchFilters): Promise<ProductResult[]> {
    console.log('[SearchAgent] Query received:', query);

    // Apply voice corrections first (unique to chatbot context)
    const correctedQuery = this.applyVoiceCorrections(query);
    console.log('[SearchAgent] After voice corrections:', correctedQuery);

    const feed = await getProductFeed();
    let products = this.normalizeProducts(feed.products);

    // Apply dietary and price filters before search scoring
    if (filters?.dietary && filters.dietary.length > 0) {
      products = products.filter(p => {
        const productTags = (p.tags || []).map(t => t.toLowerCase());
        return filters.dietary!.some(d =>
          productTags.includes(d.toLowerCase()) ||
          (d === 'vegan' && (p.isVegan || p.vegan)) ||
          (d === 'kosher' && (p.isKosher || p.kashrut)) ||
          (d === 'organic' && (p.isOrganic || p.organic)) ||
          (d === 'gluten-free' && (p.isGlutenFree || p.glutenFree))
        );
      });
    }

    if (filters?.priceMax) {
      products = products.filter(p => p.price <= filters.priceMax!);
    }

    if (filters?.inStock) {
      products = products.filter(p => p.inStock !== false);
    }

    // Use hybridSearch for scoring (handles synonyms, Hebrew, field weighting)
    const scored = hybridSearch(correctedQuery, products, {
      limit: 12,
      category: filters?.category,
      vendor: filters?.vendor,
    });

    console.log('[SearchAgent] hybridSearch results:', scored.length);
    if (scored.length > 0) {
      console.log('[SearchAgent] Top 3:', scored.slice(0, 3).map(s => ({
        name: s.product.name,
        score: s.score.toFixed(3),
        matchType: s.matchType,
      })));
    }

    return scored.map(({ product }) => this.toProductResult(product));
  }

  /**
   * Browse products by category
   */
  async browseCategory(category: string): Promise<ProductResult[]> {
    const feed = await getProductFeed({ category });
    const products = this.normalizeProducts(feed.products);
    return products.slice(0, 12).map(p => this.toProductResult(p));
  }

  /**
   * Browse products by vendor
   */
  async browseVendor(vendorId: string, category?: string): Promise<ProductResult[]> {
    const feed = await getProductFeed({ vendorId });
    let products = this.normalizeProducts(feed.products);

    if (category) {
      products = products.filter(p =>
        p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    return products.slice(0, 12).map(p => this.toProductResult(p));
  }

  /**
   * Get products by dietary requirements
   */
  async getDietaryProducts(dietary: string[]): Promise<ProductResult[]> {
    const feed = await getProductFeed();
    const products = this.normalizeProducts(feed.products).filter(p => {
      const productTags = (p.tags || []).map(t => t.toLowerCase());
      return dietary.some(d => {
        const dLower = d.toLowerCase();
        return productTags.includes(dLower) ||
          (dLower === 'vegan' && (p.isVegan || p.vegan)) ||
          (dLower === 'kosher' && (p.isKosher || p.kashrut)) ||
          (dLower === 'organic' && (p.isOrganic || p.organic)) ||
          (dLower === 'gluten-free' && (p.isGlutenFree || p.glutenFree));
      });
    });

    return products.slice(0, 12).map(p => this.toProductResult(p));
  }

  /**
   * Get product details by ID
   */
  async getProductDetails(productId: string): Promise<ProductResult | null> {
    const product = await getProductById(productId);
    if (!product) return null;
    return this.toProductResult(this.normalizeProducts([product])[0]);
  }

  /**
   * List all vendors
   */
  async listVendors() {
    const feed = await getVendorFeed();
    const vendors = feed.vendors;
    return vendors.map(v => ({
      id: v.id,
      name: v.name,
      description: v.description,
      logo: v.logo,
      productCount: v.productCount,
      categories: v.categories,
    }));
  }

  /**
   * List all categories with counts
   */
  async listCategories() {
    const feed = await getProductFeed();
    const counts = new Map<string, number>();
    for (const product of feed.products) {
      const category = product.category || 'general';
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([id, count]) => ({
      id,
      name: id.replace(/-/g, ' '),
      count,
    }));
  }

  /**
   * Convert internal product to result format
   */
  private toProductResult(product: EnhancedProduct): ProductResult {
    return {
      id: product.id,
      name: product.name,
      nameHe: product.nameHe ?? undefined,
      description: product.description ?? undefined,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image || '/images/placeholder-product.jpg',
      vendorId: product.vendorId || '',
      vendorName: product.vendorName || '',
      category: product.category ?? undefined,
      inStock: product.inStock !== false,
      tags: product.tags,
      badge: product.badge ?? undefined,
    };
  }
}

// Singleton instance
export const searchAgent = new SearchAgent();
