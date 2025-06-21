import { NextRequest, NextResponse } from 'next/server';
import elevenLabsV3 from '@/lib/services/elevenlabs-v3';
import { getAllProducts, searchProducts, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audio_url?: string;
}

interface ProductRecommendation {
  product: any;
  reason: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id, voice_enabled = true, voice_id } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('🤖 KFAR AI Chat Request:', { message, voice_enabled, voice_id });

    // Process the message and generate intelligent response
    const response = await processKfarMessage(message);
    
    let audioUrl = null;

    // Generate voice response if enabled
    if (voice_enabled) {
      try {
        const audioBuffer = await elevenLabsV3.textToSpeech({
          text: response.text,
          voice_id: voice_id || elevenLabsV3.voices.daniella,
          voice_settings: elevenLabsV3.getVoiceSettings('customer_service'),
          optimize_streaming_latency: 2
        });

        // Convert to base64 for demo (in production, save to cloud storage)
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        
        console.log('🎤 Generated audio response');
      } catch (audioError) {
        console.error('❌ Audio generation failed:', audioError);
        // Continue without audio
      }
    }

    return NextResponse.json({
      success: true,
      response: {
        text: response.text,
        audio_url: audioUrl,
        products: response.products || [],
        suggestions: response.suggestions || [],
        conversation_id: conversation_id || `kfar_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function processKfarMessage(message: string) {
  const lowercaseMessage = message.toLowerCase();
  
  // Get all products for context
  const allProducts = getAllProducts();
  
  // Intent detection and response generation
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
    return {
      text: "Shalom! Welcome to KFAR Marketplace! I'm your AI assistant, here to help you discover amazing vegan products from our Village of Peace community. We've been creating delicious plant-based foods for over 50 years. What can I help you find today?",
      suggestions: ['Show me popular products', 'Tell me about vendors', 'Find vegan protein options', 'What\'s new this week?']
    };
  }
  
  // Product search
  if (lowercaseMessage.includes('find') || lowercaseMessage.includes('search') || lowercaseMessage.includes('looking for')) {
    const searchResults = searchProducts(message);
    const topResults = searchResults.slice(0, 3);
    
    if (topResults.length > 0) {
      const productNames = topResults.map(p => p.name).join(', ');
      return {
        text: `I found ${searchResults.length} products that match your search! Here are my top recommendations: ${productNames}. All of our products are 100% vegan and made with love in our Village of Peace community. Would you like to know more about any of these?`,
        products: topResults,
        suggestions: ['Tell me more about these products', 'Show nutrition info', 'Add to cart', 'Find similar products']
      };
    } else {
      return {
        text: "I couldn't find exact matches, but let me suggest some of our most popular items! We have amazing schnitzels from Teva Deli, artisanal spreads from Garden of Light, and gourmet meals from Queen's Cuisine. What type of food are you in the mood for?",
        products: allProducts.filter(p => p.isFeatured).slice(0, 3),
        suggestions: ['Show popular products', 'Browse by category', 'Tell me about Teva Deli', 'What\'s vegan protein?']
      };
    }
  }
  
  // Vendor information
  if (lowercaseMessage.includes('vendor') || lowercaseMessage.includes('store') || lowercaseMessage.includes('shop')) {
    const vendors = [
      'Teva Deli - Our premium plant-based meat alternatives',
      'Garden of Light - Artisanal vegan spreads and cheeses', 
      'Queen\'s Cuisine - Gourmet ready-to-eat meals',
      'Gahn Delight - Specialty items and treats',
      'VOP Shop - Community general store',
      'People Store - Local community products'
    ];
    
    return {
      text: `We have 6 amazing vendors in our marketplace, each with their own specialty: ${vendors.join('; ')}. Each vendor has been part of our community for years and creates products with authentic Village of Peace recipes. Which vendor interests you most?`,
      suggestions: ['Tell me about Teva Deli', 'Show Garden of Light products', 'What\'s in Queen\'s Cuisine?', 'Browse all vendors']
    };
  }
  
  // Nutrition and health
  if (lowercaseMessage.includes('nutrition') || lowercaseMessage.includes('healthy') || lowercaseMessage.includes('protein') || lowercaseMessage.includes('vitamins')) {
    const proteinProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('schnitzel') || 
      p.name.toLowerCase().includes('tofu') || 
      p.name.toLowerCase().includes('seitan') ||
      p.category.includes('protein')
    ).slice(0, 3);
    
    return {
      text: "Our vegan products are packed with nutrition! We've perfected plant-based proteins over 50 years. Our schnitzels are high in protein, our spreads contain healthy fats, and everything is made from whole food ingredients. Our community has thrived on this diet for decades - it's not just healthy, it's delicious!",
      products: proteinProducts,
      suggestions: ['Show protein-rich products', 'Tell me about vegan nutrition', 'Community health benefits', 'Recipe suggestions']
    };
  }
  
  // Default helpful response
  return {
    text: "I'm here to help you explore our amazing vegan marketplace! We have over 100 products from 6 local vendors, all created in our Village of Peace community. I can help you find products, learn about our vendors, get nutrition information, or share our community story. What interests you most?",
    suggestions: ['Browse popular products', 'Tell me about vendors', 'Community story', 'Vegan nutrition info'],
    products: allProducts.filter(p => p.isFeatured).slice(0, 3)
  };
}

// Streaming endpoint for real-time voice responses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const voice_id = searchParams.get('voice_id');
  
  if (!text) {
    return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
  }

  try {
    const stream = await elevenLabsV3.streamTextToSpeech({
      text,
      voice_id: voice_id || elevenLabsV3.voices.daniella,
      optimize_streaming_latency: 4
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('❌ Streaming TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
