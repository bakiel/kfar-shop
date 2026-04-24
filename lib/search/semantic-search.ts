/**
 * Hybrid Search for KFAR Marketplace
 * Provides keyword-based search with synonym expansion and Hebrew support.
 * Designed to gracefully support semantic/embedding search when available.
 */

import { EnhancedProduct } from '@/lib/data/wordpress-style-data-layer';

export interface ScoredProduct {
  product: EnhancedProduct;
  score: number;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

export interface SearchOptions {
  limit?: number;
  category?: string;
  vendor?: string;
  semanticWeight?: number;
}

// Synonym map for common vegan marketplace queries
const SYNONYMS: Record<string, string[]> = {
  'meat': ['seitan', 'protein', 'meatless', 'schnitzel', 'burger', 'shawarma', 'kebab', 'sausage', 'steak'],
  'chicken': ['seitan', 'schnitzel', 'nugget', 'poultry'],
  'beef': ['seitan', 'burger', 'steak', 'ground'],
  'cheese': ['cashew cheese', 'vegan cheese', 'spread', 'cream'],
  'milk': ['oat', 'almond', 'soy', 'plant-based', 'dairy-free'],
  'ice cream': ['gelato', 'frozen', 'sorbet', 'popsicle'],
  'chocolate': ['cocoa', 'cacao', 'carob'],
  'bread': ['challah', 'pita', 'loaf', 'roll', 'baked'],
  'snack': ['chips', 'crackers', 'nuts', 'bar', 'energy'],
  'drink': ['juice', 'smoothie', 'tea', 'beverage', 'kombucha'],
  'sauce': ['dressing', 'dip', 'hummus', 'tahini', 'marinade'],
  'tofu': ['soy', 'bean curd', 'protein'],
  'seitan': ['wheat protein', 'meat alternative', 'meatless'],
  'spread': ['hummus', 'tahini', 'dip', 'paste', 'butter'],
  'salad': ['fresh', 'greens', 'mixed', 'bowl'],
  'dessert': ['sweet', 'cake', 'cookie', 'treat', 'pastry', 'ice cream', 'chocolate', 'sorbet'],
  'desserts': ['sweet', 'cake', 'cookie', 'treat', 'pastry', 'ice cream', 'chocolate', 'sorbet', 'dessert'],
  'protein': ['seitan', 'tofu', 'tempeh', 'legume', 'bean'],
  'organic': ['natural', 'bio', 'wholesome'],
  'healthy': ['nutritious', 'wholesome', 'natural', 'organic', 'raw'],
  'spicy': ['hot', 'chili', 'pepper', 'jalapeno'],
  'burger': ['patty', 'meatless burger', 'plant burger'],
  'schnitzel': ['cutlet', 'breaded', 'crispy'],
};

// Hebrew synonym map
const HEBREW_SYNONYMS: Record<string, string[]> = {
  'בשר': ['סייטן', 'חלבון', 'שניצל', 'בורגר', 'קבב'],
  'גבינה': ['גבינה טבעונית', 'ממרח', 'קשיו'],
  'חלב': ['שיבולת שועל', 'שקדים', 'סויה'],
  'גלידה': ["ג'לטו", 'קפוא', 'סורבה'],
  'שוקולד': ['קקאו', 'חרוב'],
};

/**
 * Detect if a string contains Hebrew characters
 */
function hasHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * Normalize text for matching: lowercase, remove extra spaces, trim
 */
function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Tokenize a query into individual terms
 */
function tokenize(query: string): string[] {
  return normalize(query).split(' ').filter(t => t.length > 0);
}

/**
 * Expand query tokens with synonyms
 */
function expandWithSynonyms(tokens: string[], isHebrew: boolean): string[] {
  const expanded = new Set(tokens);
  const synonymMap = isHebrew ? HEBREW_SYNONYMS : SYNONYMS;

  for (const token of tokens) {
    // Check direct synonym match
    if (synonymMap[token]) {
      for (const syn of synonymMap[token]) {
        expanded.add(syn.toLowerCase());
      }
    }
    // Check if token appears as a synonym value (reverse lookup)
    for (const [key, syns] of Object.entries(synonymMap)) {
      if (syns.some(s => s.toLowerCase() === token)) {
        expanded.add(key.toLowerCase());
      }
    }
  }

  return Array.from(expanded);
}

// Weights for different field matches
const FIELD_WEIGHTS = {
  name: 1.0,
  nameHe: 0.95,
  description: 0.4,
  category: 0.6,
  vendorName: 0.3,
  tags: 0.5,
  ingredients: 0.3,
};

/**
 * Score a single product against expanded query tokens
 */
function scoreProduct(product: EnhancedProduct, originalTokens: string[], expandedTokens: string[], isHebrew: boolean): number {
  let totalScore = 0;
  const normalizedQuery = originalTokens.join(' ');

  // Build searchable fields
  const fields: { text: string; weight: number }[] = [
    { text: normalize(product.name || ''), weight: FIELD_WEIGHTS.name },
    { text: normalize(product.description || ''), weight: FIELD_WEIGHTS.description },
    { text: normalize(product.category || ''), weight: FIELD_WEIGHTS.category },
    { text: normalize(product.vendorName || ''), weight: FIELD_WEIGHTS.vendorName },
  ];

  // Add Hebrew fields
  if (product.nameHe) {
    fields.push({ text: normalize(product.nameHe), weight: FIELD_WEIGHTS.nameHe });
  }
  if ((product as any).nameHebrew) {
    fields.push({ text: normalize((product as any).nameHebrew), weight: FIELD_WEIGHTS.nameHe });
  }

  // Add tags
  if (product.tags) {
    fields.push({ text: normalize(product.tags.join(' ')), weight: FIELD_WEIGHTS.tags });
  }

  // Add ingredients
  if (product.ingredients) {
    fields.push({ text: normalize(product.ingredients.join(' ')), weight: FIELD_WEIGHTS.ingredients });
  }

  for (const field of fields) {
    if (!field.text) continue;

    // Exact phrase match (highest bonus)
    if (field.text.includes(normalizedQuery)) {
      totalScore += field.weight * 1.0;
    }

    // Token matching
    let matchedOriginal = 0;
    let matchedExpanded = 0;

    for (const token of originalTokens) {
      if (field.text.includes(token)) {
        matchedOriginal++;
      }
    }

    for (const token of expandedTokens) {
      if (field.text.includes(token)) {
        matchedExpanded++;
      }
    }

    // Original token matches are weighted more heavily than synonym matches
    if (originalTokens.length > 0) {
      const originalRatio = matchedOriginal / originalTokens.length;
      totalScore += field.weight * originalRatio * 0.8;
    }

    // Expanded tokens (synonyms) contribute less
    if (expandedTokens.length > 0) {
      const expandedRatio = matchedExpanded / expandedTokens.length;
      totalScore += field.weight * expandedRatio * 0.3;
    }

    // Starts-with bonus for name field
    if (field.weight === FIELD_WEIGHTS.name || field.weight === FIELD_WEIGHTS.nameHe) {
      for (const token of originalTokens) {
        if (field.text.startsWith(token)) {
          totalScore += 0.2;
        }
      }
    }
  }

  // Normalize score to 0-1 range (rough normalization)
  // Max theoretical: ~3.5 per field * 7 fields = ~24.5
  const maxTheoretical = 5;
  return Math.min(totalScore / maxTheoretical, 1.0);
}

/**
 * Keyword-based search with synonym expansion and Hebrew support
 */
export function keywordSearch(query: string, products: EnhancedProduct[]): ScoredProduct[] {
  if (!query || query.trim().length < 2) return [];

  const isHebrew = hasHebrew(query);
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const expandedTokens = expandWithSynonyms(tokens, isHebrew);

  const scored: ScoredProduct[] = [];

  for (const product of products) {
    const score = scoreProduct(product, tokens, expandedTokens, isHebrew);
    if (score > 0.01) {
      scored.push({
        product,
        score,
        matchType: 'keyword',
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Hybrid search: uses semantic search when embeddings are available,
 * otherwise falls back to keyword search.
 */
export function hybridSearch(
  query: string,
  products: EnhancedProduct[],
  options?: SearchOptions
): ScoredProduct[] {
  const limit = options?.limit ?? 20;

  // Apply pre-filters (category, vendor) before scoring
  let candidates = products;

  if (options?.category) {
    const cat = options.category.toLowerCase();
    const filtered = candidates.filter(p =>
      (p.category || '').toLowerCase() === cat
    );
    // Only apply strict category filter if it matches some products;
    // otherwise let the query handle it (e.g. "desserts" isn't a real category)
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  if (options?.vendor) {
    const vendor = options.vendor.toLowerCase();
    candidates = candidates.filter(p =>
      (p.vendorId || '').toLowerCase() === vendor
    );
  }

  // For now, keyword-only (semantic can be added later)
  const results = keywordSearch(query, candidates);

  return results.slice(0, limit);
}
