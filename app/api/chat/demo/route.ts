import { NextRequest, NextResponse } from 'next/server';

// Simple mock data for demo - no external dependencies
const mockProducts = [
  {
    id: 'teva-001',
    name: 'Classic Vegan Schnitzel',
    vendorId: 'teva-deli',
    vendorName: 'Teva Deli',
    price: 25,
    image: '/images/teva-deli/schnitzel-classic.jpg',
    description: 'Our signature plant-based schnitzel, crispy and delicious'
  },
  {
    id: 'garden-001', 
    name: 'Cashew Spread Deluxe',
    vendorId: 'garden-of-light',
    vendorName: 'Garden of Light',
    price: 18,
    image: '/images/garden-of-light/cashew-spread.jpg',
    description: 'Artisanal cashew spread with herbs and spices'
  },
  {
    id: 'queens-001',
    name: 'Gourmet Protein Bowl',
    vendorId: 'queens-cuisine',
    vendorName: "Queen's Cuisine", 
    price: 32,
    image: '/images/queens-cuisine/protein-bowl.jpg',
    description: 'Complete meal with plant-based proteins and vegetables'
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Demo Chat API called');
    
    const { message, conversation_id, voice_enabled = false } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('🤖 Processing message:', message);

    // Simple message processing for demo
    const response = processMessage(message);
    
    // Return response without audio for now (to avoid loading errors)
    return NextResponse.json({
      success: true,
      response: {
        text: response.text,
        audio_url: null, // Disable audio to fix loading error
        products: response.products || [],
        suggestions: response.suggestions || [],
        conversation_id: conversation_id || `kfar_demo_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Demo Chat API Error:', error);
    
    // Return helpful fallback response
    return NextResponse.json({
      success: true,
      response: {
        text: "Welcome to KFAR Marketplace! I'm your AI assistant. I can help you discover our amazing vegan products from the Village of Peace community. What would you like to know about?",
        audio_url: null,
        products: mockProducts.slice(0, 2),
        suggestions: ['Show me products', 'Tell me about vendors', 'Community story'],
        conversation_id: `kfar_demo_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  }
}

function processMessage(message: string) {
  const lowercaseMessage = message.toLowerCase();
  
  // Greetings
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
    return {
      text: "Shalom! Welcome to KFAR Marketplace! I'm your AI assistant from the Village of Peace community in Dimona, Israel. We've been creating amazing vegan products for over 50 years. How can I help you today?",
      suggestions: ['Show me popular products', 'Tell me about vendors', 'Community story', 'What makes you special?'],
      products: mockProducts.slice(0, 2)
    };
  }
  
  // Product search
  if (lowercaseMessage.includes('product') || lowercaseMessage.includes('food') || lowercaseMessage.includes('show') || lowercaseMessage.includes('popular')) {
    return {
      text: "Here are some of our most popular products! Our Teva Deli schnitzel is a community favorite - crispy, protein-rich, and made with our secret spice blend. Garden of Light creates artisanal spreads that even non-vegans love. All our products are 100% vegan and made with love in our community.",
      products: mockProducts,
      suggestions: ['Tell me about Teva Deli', 'What about nutrition?', 'How do you make these?', 'Add to cart']
    };
  }
  
  // Vendor information
  if (lowercaseMessage.includes('vendor') || lowercaseMessage.includes('teva') || lowercaseMessage.includes('deli')) {
    return {
      text: "Teva Deli is our premium plant-based meat alternative specialist! They've been perfecting vegan schnitzels, burgers, and protein products for over 15 years. Using traditional Israeli spices and modern plant-based techniques, they create products that even meat-eaters love. Their secret? Generations of community recipes and sustainable ingredients.",
      products: [mockProducts[0]],
      suggestions: ['Show me Teva products', 'What about other vendors?', 'How is it made?', 'Order now']
    };
  }
  
  // Community story
  if (lowercaseMessage.includes('community') || lowercaseMessage.includes('story') || lowercaseMessage.includes('special') || lowercaseMessage.includes('village')) {
    return {
      text: "The Village of Peace was established in 1967 in Dimona, Israel, by Ben Ammi Ben-Israel. We've been a 100% vegan community for over 50 years, pioneering sustainable living and holistic health. Our marketplace represents generations of culinary wisdom - every recipe tells a story of transformation, health, and community love. We're not just selling products, we're sharing a lifestyle that has sustained our community for decades!",
      suggestions: ['Tell me about the food', 'How did this start?', 'Show me products', 'What makes it healthy?']
    };
  }
  
  // Nutrition and health
  if (lowercaseMessage.includes('nutrition') || lowercaseMessage.includes('healthy') || lowercaseMessage.includes('protein')) {
    return {
      text: "Our community has thrived on plant-based nutrition for 50+ years! Our products are rich in protein, vitamins, and minerals. The schnitzel has complete amino acids, our spreads provide healthy fats, and everything is made from whole food ingredients. We've proven that vegan food isn't just healthy - it's delicious, satisfying, and energizing!",
      products: [mockProducts[0], mockProducts[2]],
      suggestions: ['Show protein products', 'What about ingredients?', 'Recipe ideas', 'Health benefits']
    };
  }
  
  // Default response
  return {
    text: "I'm here to help you discover our amazing vegan marketplace! We have over 100 products from 6 local vendors, all created in our Village of Peace community. I can tell you about our products, share our community story, or help you find exactly what you're looking for. What interests you most?",
    suggestions: ['Show me products', 'Tell me about vendors', 'Community story', 'What makes you special?'],
    products: mockProducts.slice(0, 2)
  };
}

// Simple GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'KFAR Demo Chat API is working!',
    timestamp: new Date().toISOString(),
    features: ['Text chat', 'Product recommendations', 'Community stories'],
    mockProducts: mockProducts.length
  });
}
