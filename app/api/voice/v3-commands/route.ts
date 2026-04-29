import { NextRequest, NextResponse } from 'next/server';
import { parseVoiceCommand, CommandIntent } from '@/lib/voice/voiceCommandParser';
import { AGENT_INTRO } from '@/config/voice';
import { getProductFeed } from '@/lib/services/live-product-feed';

async function searchProducts(query: string, filters?: any) {
  try {
    const feed = await getProductFeed({
      search: query || null,
      limit: 25,
    });

    let products = feed.products;

    if (filters?.maxPrice) {
      products = products.filter(product => product.price <= filters.maxPrice);
    }

    if (filters?.dietary) {
      products = products.filter(product => {
        if (filters.dietary.includes('vegan') && !product.vegan) return false;
        if (filters.dietary.includes('kosher') && !product.kashrut) return false;
        if (filters.dietary.includes('organic') && !product.organic) return false;
        return true;
      });
    }

    return products.slice(0, 10);
  } catch (error) {
    console.error('Product search error:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      command,
      language = 'en',
      context = {}
    } = body;

    if (!command) {
      return NextResponse.json(
        { error: 'Command text is required' },
        { status: 400 }
      );
    }

    const parsed = parseVoiceCommand(command, language as 'en' | 'he' | 'ar');

    let response: any = {
      intent: parsed.intent,
      confidence: parsed.confidence,
      entities: parsed.entities
    };

    switch (parsed.intent) {
      case CommandIntent.SEARCH_PRODUCT: {
        const searchResults = await searchProducts(
          parsed.entities.product || '',
          { dietary: parsed.entities.dietary }
        );
        response.products = searchResults;
        response.message = searchResults.length > 0
          ? `Found ${searchResults.length} products matching "${parsed.entities.product}"`
          : `No products found for "${parsed.entities.product}"`;
        response.voiceResponse = searchResults.length > 0
          ? `I found ${searchResults[0].name} for ${searchResults[0].price} shekels. Want to add it to your cart?`
          : `Sorry, I couldn't find ${parsed.entities.product}. Try another search?`;
        break;
      }

      case CommandIntent.ADD_TO_CART:
        response.action = 'add_to_cart';
        response.quantity = parsed.entities.quantity || 1;
        response.voiceResponse = 'Added to your cart. Anything else?';
        break;

      case CommandIntent.SHOW_CART:
        response.action = 'show_cart';
        response.voiceResponse = "Here's what's in your cart.";
        break;

      case CommandIntent.CHECKOUT:
        response.action = 'checkout';
        response.voiceResponse = 'Taking you to checkout.';
        break;

      case CommandIntent.SHOW_DEALS: {
        const deals = await searchProducts('special');
        response.products = deals;
        response.voiceResponse = deals.length > 0
          ? `Today's special: ${deals[0].name} for only ${deals[0].price} shekels!`
          : "Check back later for today's specials!";
        break;
      }

      case CommandIntent.SHOW_BESTSELLERS: {
        const bestsellers = await searchProducts('best');
        response.products = bestsellers;
        response.voiceResponse = bestsellers.length > 0
          ? `Our best seller is ${bestsellers[0].name}. Only ${bestsellers[0].price} shekels!`
          : 'Browse our full catalog for popular items!';
        break;
      }

      case CommandIntent.FILTER_PRICE: {
        const priceFiltered = await searchProducts('', {
          maxPrice: parsed.entities.price
        });
        response.products = priceFiltered;
        response.voiceResponse = priceFiltered.length > 0
          ? `Found ${priceFiltered[0].name} for ${priceFiltered[0].price} shekels.`
          : `No products found under ${parsed.entities.price} shekels.`;
        break;
      }

      case CommandIntent.DIETARY_FILTER: {
        const dietaryFiltered = await searchProducts('', {
          dietary: parsed.entities.dietary
        });
        response.products = dietaryFiltered;
        response.voiceResponse = dietaryFiltered.length > 0
          ? `Here's a ${parsed.entities.dietary?.join(', ')} option: ${dietaryFiltered[0].name}`
          : `No ${parsed.entities.dietary?.join(', ')} products found.`;
        break;
      }

      case CommandIntent.HELP: {
        const voice = context?.voice || 'daniella';
        const lang = language || 'en';
        response.voiceResponse = AGENT_INTRO[lang][voice] || AGENT_INTRO.en.daniella;
        response.action = 'show_help';
        break;
      }

      default:
        response.voiceResponse = "I didn't quite catch that. Try saying 'show me vegan products' or 'what's on sale?'";
        response.suggestions = [
          "What's on sale?",
          'Show me vegan products',
          'I need hummus',
          'Best sellers'
        ];
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Voice command processing error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to process voice command',
        intent: CommandIntent.UNKNOWN,
        voiceResponse: 'Sorry, I had trouble understanding that. Please try again.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Voice Commands V3 API',
    source: 'database',
    endpoints: {
      POST: '/api/voice/v3-commands',
      body: {
        command: 'string (required) - The voice command text',
        language: 'en | he | ar (default: en)',
        context: 'object (optional) - Additional context'
      }
    },
    examples: [
      { command: 'Show me vegan products', language: 'en' },
      { command: "What's on sale?", language: 'en' },
      { command: 'Add to cart', language: 'en' },
      { command: 'תראה לי מוצרים טבעוניים', language: 'he' },
      { command: 'أرني المنتجات النباتية', language: 'ar' }
    ],
    intents: Object.values(CommandIntent)
  });
}
