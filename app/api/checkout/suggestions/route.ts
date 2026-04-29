import { NextRequest, NextResponse } from 'next/server';
import { getProductFeed, ProductFeedProduct } from '@/lib/services/live-product-feed';

interface CartItem {
  id: string;
  name: string;
  vendorId: string;
  category?: string;
}

// Category complementary map: what goes well with what
const complementaryMap: Record<string, string[]> = {
  'schnitzels': ['salads', 'spreads', 'beverages', 'cheeses'],
  'burgers': ['salads', 'beverages', 'ice-cream', 'spreads'],
  'shawarma': ['salads', 'spreads', 'beverages'],
  'kebabs': ['salads', 'spreads', 'beverages'],
  'meatballs': ['salads', 'spreads', 'beverages'],
  'tofu': ['salads', 'spreads', 'ready-meals', 'beverages'],
  'seitan': ['salads', 'spreads', 'beverages'],
  'ready-meals': ['salads', 'beverages', 'ice-cream'],
  'spreads': ['bulk-foods', 'pantry', 'snacks'],
  'cheeses': ['bulk-foods', 'pantry', 'snacks'],
  'salads': ['schnitzels', 'burgers', 'beverages', 'spreads'],
  'ice-cream': ['chocolates', 'sorbet', 'beverages'],
  'sorbet': ['chocolates', 'ice-cream', 'beverages'],
  'parfait': ['chocolates', 'beverages'],
  'popsicles': ['ice-cream', 'sorbet'],
  'chocolates': ['ice-cream', 'beverages', 'snacks'],
  'apparel': ['mugs', 'accessories', 'home-decor'],
  'mugs': ['apparel', 'accessories'],
  'accessories': ['apparel', 'mugs', 'home-decor'],
  'home-decor': ['apparel', 'accessories', 'mugs'],
  'bulk-foods': ['pantry', 'snacks', 'beverages'],
  'pantry': ['bulk-foods', 'snacks', 'beverages'],
  'snacks': ['beverages', 'bulk-foods', 'chocolates'],
  'beverages': ['snacks', 'chocolates', 'ice-cream'],
};

// High-level type groupings for fallback matching
const typeGroups: Record<string, string[]> = {
  'main-dishes': ['schnitzels', 'burgers', 'shawarma', 'kebabs', 'meatballs', 'seitan', 'tofu', 'ready-meals'],
  'sides': ['salads', 'spreads', 'cheeses'],
  'desserts': ['ice-cream', 'sorbet', 'parfait', 'popsicles', 'chocolates'],
  'grocery': ['bulk-foods', 'pantry', 'snacks', 'beverages'],
  'merchandise': ['apparel', 'mugs', 'accessories', 'home-decor'],
};

function getTypeGroup(category: string): string | null {
  for (const [group, cats] of Object.entries(typeGroups)) {
    if (cats.includes(category)) return group;
  }
  return null;
}

// Determine a reason string for the suggestion
function getSuggestionReason(cartCategory: string, suggestedCategory: string): { en: string; he: string } {
  const cartGroup = getTypeGroup(cartCategory);
  const sugGroup = getTypeGroup(suggestedCategory);

  if (cartGroup === 'main-dishes' && sugGroup === 'sides') {
    return { en: 'Complete your meal', he: 'השלם את הארוחה' };
  }
  if (cartGroup === 'main-dishes' && sugGroup === 'desserts') {
    return { en: 'Add a sweet finish', he: 'הוסף סיום מתוק' };
  }
  if (cartGroup === 'main-dishes' && sugGroup === 'grocery') {
    return { en: 'Pair with your order', he: 'השלם את ההזמנה' };
  }
  if (sugGroup === 'desserts') {
    return { en: 'Treat yourself', he: 'פנק את עצמך' };
  }
  if (sugGroup === 'grocery') {
    return { en: 'Stock up while you shop', he: 'מלא מלאי בזמן הקנייה' };
  }
  if (sugGroup === 'merchandise') {
    return { en: 'Show your community pride', he: 'הראה גאוות קהילה' };
  }
  return { en: 'You might also like', he: 'אולי תאהב גם' };
}

export async function POST(request: NextRequest) {
  try {
    const { cartItems } = await request.json() as { cartItems: CartItem[] };

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const feed = await getProductFeed();
    const allProducts = feed.products;
    const cartIds = new Set(cartItems.map(item => item.id));
    const cartVendorIds = new Set(cartItems.map(item => item.vendorId));
    const cartCategories = new Set<string>();

    // Collect categories from cart items
    for (const cartItem of cartItems) {
      if (cartItem.category) {
        cartCategories.add(cartItem.category);
      } else {
        // Look up category from product catalog
        const product = allProducts.find((p: ProductFeedProduct) => p.id === cartItem.id);
        if (product?.category) {
          cartCategories.add(product.category);
        }
      }
    }

    // Build set of desired complementary categories
    const targetCategories = new Set<string>();
    for (const cat of cartCategories) {
      const complements = complementaryMap[cat];
      if (complements) {
        for (const c of complements) {
          if (!cartCategories.has(c)) {
            targetCategories.add(c);
          }
        }
      }
    }

    // Score and filter candidate products
    interface ScoredProduct {
      id: string;
      name: string;
      nameHe?: string;
      price: number;
      originalPrice?: number;
      image: string;
      vendorId: string;
      vendorName: string;
      category: string;
      score: number;
      reason: { en: string; he: string };
    }

    const candidates: ScoredProduct[] = [];

    for (const product of allProducts) {
      // Skip items already in cart
      if (cartIds.has(product.id)) continue;

      // Skip out of stock
      if (!product.inStock) continue;

      // Prefer cross-vendor (but don't require it)
      const isCrossVendor = !cartVendorIds.has(product.vendorId);

      let score = 0;

      // Complementary category match
      if (targetCategories.has(product.category)) {
        score += 10;
      }

      // Cross-vendor bonus
      if (isCrossVendor) {
        score += 5;
      }

      // Featured/best-seller bonus
      if (product.isFeatured) {
        score += 3;
      }

      // Rating bonus
      if (product.rating && product.rating >= 4.5) {
        score += 2;
      }

      // Only include if there's some relevance
      if (score < 5) continue;

      // Find the best matching cart category for reason text
      let bestReason = { en: 'You might also like', he: 'אולי תאהב גם' };
      for (const cat of cartCategories) {
        const complements = complementaryMap[cat];
        if (complements && complements.includes(product.category)) {
          bestReason = getSuggestionReason(cat, product.category);
          break;
        }
      }

      candidates.push({
        id: product.id,
        name: product.name,
        nameHe: product.nameHe || undefined,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        category: product.category,
        score,
        reason: bestReason,
      });
    }

    // Sort by score descending, then by rating
    candidates.sort((a, b) => b.score - a.score);

    // Return top 3
    const suggestions = candidates.slice(0, 3).map(({ score, ...rest }) => rest);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
