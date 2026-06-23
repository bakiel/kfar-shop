import { NextRequest, NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';

function productCard(product: any) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    vendor: product.vendorName,
    vendorId: product.vendorId,
    link: `/product/${product.id}`,
  };
}

async function searchProducts(searchQuery: string) {
  const feed = await getProductFeed({
    search: searchQuery,
    limit: 6,
  });
  return feed.products.map(productCard);
}

async function getSuggestedProducts(excludeVendorId?: string) {
  const feed = await getProductFeed({
    limit: 12,
  });
  return feed.products
    .filter(product => !excludeVendorId || product.vendorId !== excludeVendorId)
    .slice(0, 4)
    .map(productCard);
}

export async function POST(request: NextRequest) {
  try {
    const { query: userQuery, includeProducts } = await request.json();
    const normalizedQuery = String(userQuery || '').toLowerCase();

    let response = '';
    let products: ReturnType<typeof productCard>[] = [];
    let suggestedProducts: ReturnType<typeof productCard>[] = [];

    if (normalizedQuery.includes('hello') || normalizedQuery.includes('שלום')) {
      response = 'שלום! Welcome to KFAR Marketplace. I can help you find products, learn about vendors, or answer questions about the marketplace.';
    } else if (normalizedQuery.includes('vegan') || normalizedQuery.includes('טבעוני')) {
      response = 'KFAR specializes in vegan and natural products. Let me show you some options:';
      if (includeProducts) {
        products = await searchProducts('vegan organic natural');
      }
    } else if (normalizedQuery.includes('vendor') || normalizedQuery.includes('store')) {
      response = 'We have local vendors offering fresh produce, prepared foods, desserts, and community products.';
    } else if (normalizedQuery.includes('help') || normalizedQuery.includes('עזרה')) {
      response = 'I can help you search products, browse vendors, find vegan or organic options, and learn about delivery or payment options.';
    } else if (includeProducts && (
      normalizedQuery.includes('product') ||
      normalizedQuery.includes('מוצר') ||
      normalizedQuery.includes('find') ||
      normalizedQuery.includes('show')
    )) {
      products = await searchProducts(userQuery);
      response = products.length > 0
        ? `I found ${products.length} products matching your search:`
        : "I couldn't find any products matching your search. Try different keywords or browse the categories.";
    } else {
      response = 'I can help you explore KFAR marketplace. Try searching for products, asking about vendors, or browsing vegan and organic selections.';
    }

    if (products.length > 0) {
      suggestedProducts = await getSuggestedProducts(products[0].vendorId);
    }

    return NextResponse.json({
      response,
      products,
      suggestedProducts,
      suggestions: ['Browse vegan products', 'View all vendors', "Today's specials"],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        response: 'Sorry, I encountered an error. Please try again.',
        products: [],
        suggestedProducts: [],
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
