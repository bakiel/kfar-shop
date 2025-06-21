import { NextRequest, NextResponse } from 'next/server';
import { parseVoiceCommand, CommandIntent } from '@/lib/voice/voiceCommandParser';
import { getProducts } from '@/lib/db';
import { AGENT_INTRO } from '@/config/voice';

// Mock function for getting products - replace with actual DB query
async function searchProducts(query: string, filters?: any) {
  try {
    // Use the actual database function
    const products = await getProducts();
    
    // Filter based on query
    let filtered = products;
    
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm) ||
        p.category?.toLowerCase().includes(searchTerm) ||
        p.vendor?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply additional filters
    if (filters?.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters?.dietary) {
      filtered = filtered.filter(p => {
        if (filters.dietary.includes('vegan') && !p.is_vegan) return false;
        if (filters.dietary.includes('kosher') && !p.is_kosher) return false;
        if (filters.dietary.includes('organic') && !p.is_organic) return false;
        return true;
      });
    }
    
    return filtered.slice(0, 10); // Return top 10 results
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

    // Parse the voice command
    const parsed = parseVoiceCommand(command, language as 'en' | 'he' | 'ar');
    
    console.log('🎯 Voice Command Parsed:', {
      command,
      intent: parsed.intent,
      entities: parsed.entities,
      confidence: parsed.confidence
    });

    // Handle different intents
    let response: any = {
      intent: parsed.intent,
      confidence: parsed.confidence,
      entities: parsed.entities
    };

    switch (parsed.intent) {
      case CommandIntent.SEARCH_PRODUCT:
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

      case CommandIntent.ADD_TO_CART:
        response.action = 'add_to_cart';
        response.quantity = parsed.entities.quantity || 1;
        response.voiceResponse = 'Added to your cart. Anything else?';
        break;

      case CommandIntent.SHOW_CART:
        response.action = 'show_cart';
        response.voiceResponse = 'Here\'s what\'s in your cart.';
        break;

      case CommandIntent.CHECKOUT:
        response.action = 'checkout';
        response.voiceResponse = 'Taking you to checkout.';
        break;

      case CommandIntent.SHOW_DEALS:
        const deals = await searchProducts('special');
        response.products = deals;
        response.voiceResponse = deals.length > 0
          ? `Today's special: ${deals[0].name} for only ${deals[0].price} shekels!`
          : "Check back later for today's specials!";
        break;

      case CommandIntent.SHOW_BESTSELLERS:
        const bestsellers = await searchProducts('best');
        response.products = bestsellers;
        response.voiceResponse = bestsellers.length > 0
          ? `Our best seller is ${bestsellers[0].name}. Only ${bestsellers[0].price} shekels!`
          : "Browse our full catalog for popular items!";
        break;

      case CommandIntent.FILTER_PRICE:
        const priceFiltered = await searchProducts('', { 
          maxPrice: parsed.entities.price 
        });
        response.products = priceFiltered;
        response.voiceResponse = priceFiltered.length > 0
          ? `Found ${priceFiltered[0].name} for ${priceFiltered[0].price} shekels.`
          : `No products found under ${parsed.entities.price} shekels.`;
        break;

      case CommandIntent.DIETARY_FILTER:
        const dietaryFiltered = await searchProducts('', { 
          dietary: parsed.entities.dietary 
        });
        response.products = dietaryFiltered;
        response.voiceResponse = dietaryFiltered.length > 0
          ? `Here's a ${parsed.entities.dietary?.join(', ')} option: ${dietaryFiltered[0].name}`
          : `No ${parsed.entities.dietary?.join(', ')} products found.`;
        break;

      case CommandIntent.HELP:
        // Return the appropriate agent introduction
        const voice = context?.voice || 'daniella';
        const lang = language || 'en';
        response.voiceResponse = AGENT_INTRO[lang][voice] || AGENT_INTRO.en.daniella;
        response.action = 'show_help';
        break;

      default:
        response.voiceResponse = "I didn't quite catch that. Try saying 'show me vegan products' or 'what's on sale?'";
        response.suggestions = [
          "What's on sale?",
          "Show me vegan products",
          "I need hummus",
          "Best sellers"
        ];
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Voice command processing error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process voice command',
        intent: CommandIntent.UNKNOWN,
        voiceResponse: "Sorry, I had trouble understanding that. Please try again."
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Voice Commands V3 API',
    endpoints: {
      POST: '/api/voice/v3-commands',
      body: {
        command: 'string (required) - The voice command text',
        language: 'en | he | ar (default: en)',
        context: 'object (optional) - Additional context'
      }
    },
    examples: [
      { command: "Show me vegan products", language: "en" },
      { command: "What's on sale?", language: "en" },
      { command: "Add to cart", language: "en" },
      { command: "תראה לי מוצרים טבעוניים", language: "he" },
      { command: "أرني المنتجات النباتية", language: "ar" }
    ],
    intents: Object.values(CommandIntent)
  });
}