# KFAR Intelligent Chat System Guide

## Overview

The KFAR Intelligent Chat System provides comprehensive knowledge access to:
- **Full Product Catalog**: All products with prices, ingredients, dietary info
- **Vendor Information**: Detailed profiles of all 6 marketplace vendors
- **Community Knowledge**: Village of Peace history, values, and lifestyle
- **Policies**: Shipping, returns, kosher/vegan certification
- **Recipes**: Meal ideas using marketplace products
- **FAQs**: Common questions and instant answers

## Architecture

### 1. Knowledge Base (`lib/ai/knowledge-base.ts`)
- Stores all marketplace information in structured documents
- Generates embeddings for semantic search
- Supports multiple document types
- Real-time updates when products change

### 2. Intelligent Chat API (`app/api/intelligent-chat/route.ts`)
- Streaming responses with Vercel AI SDK
- Access to knowledge base via tools
- Context-aware responses
- Multi-language support

### 3. React Hook (`hooks/useIntelligentChat.ts`)
- Easy integration in components
- Knowledge search capabilities
- Conversation management
- User context tracking

## Key Features

### 1. Comprehensive Product Knowledge
```typescript
// The AI knows about every product
"Tell me about your vegan ice cream options"
// → Lists all Gahn Delight products with prices and flavors

"What products are under 30 shekels?"
// → Searches entire catalog with price filter
```

### 2. Vendor Expertise
```typescript
// Detailed vendor information
"Tell me about Teva Deli"
// → Full vendor profile, history, specialties, popular products

"Which vendor sells organic groceries?"
// → Identifies People Store with product listings
```

### 3. Community Context
```typescript
// Rich community knowledge
"Tell me about the Village of Peace"
// → History since 1967, lifestyle, values, achievements

"Why are all products vegan?"
// → Explains 50+ years of community veganism
```

### 4. Smart Recipe Suggestions
```typescript
// Recipe ideas using marketplace products
"I want to make a complete meal"
// → Suggests KFAR Hummus Bowl with ingredients and prices

"Dessert ideas using your products"
// → Recommends Gahn Delight sundae combinations
```

### 5. Policy Information
```typescript
// Instant policy access
"How much is shipping?"
// → Detailed shipping costs and options

"Can I return fresh products?"
// → Explains return policy for different product types
```

## Implementation Examples

### Basic Chat Integration
```typescript
import IntelligentChatWidget from '@/components/chat/IntelligentChatWidget';

export default function YourPage() {
  return (
    <>
      {/* Your page content */}
      <IntelligentChatWidget />
    </>
  );
}
```

### Custom Chat with User Context
```typescript
import { useIntelligentChat } from '@/hooks/useIntelligentChat';

function CustomChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    searchKnowledge,
    askAbout,
  } = useIntelligentChat({
    userName: 'Sarah',
    preferences: {
      dietary: ['gluten-free', 'sugar-free'],
      favorite_vendors: ['Gahn Delight', 'Garden of Light'],
    },
  });

  // Chat understands user preferences
  // "Show me desserts" → Suggests sugar-free ice cream
}
```

### Knowledge Search
```typescript
// Direct knowledge search
const results = await searchKnowledge('organic', 'product');
// Returns all organic products

// Category-specific search
const vendors = await searchKnowledge('deli', 'vendor');
// Returns vendor information

// Recipe search
const recipes = await searchKnowledge('hummus', 'recipe');
// Returns recipes using hummus
```

## Tool Capabilities

### 1. Product Search Tool
```typescript
searchProducts: {
  query: "ice cream",
  vendor: "Gahn Delight",
  maxPrice: 30,
  category: "dessert"
}
// → Returns filtered products with full details
```

### 2. Knowledge Search Tool
```typescript
searchKnowledge: {
  query: "shipping to Tel Aviv",
  type: "policy"
}
// → Returns shipping policy information
```

### 3. Vendor Information Tool
```typescript
getVendorInfo: {
  vendorName: "Teva Deli"
}
// → Returns comprehensive vendor profile
```

### 4. Recipe Finder Tool
```typescript
findRecipe: {
  ingredients: ["chickpeas", "tahini"],
  mealType: "lunch"
}
// → Returns matching recipes with instructions
```

## Conversation Examples

### Example 1: New Customer
```
User: "I'm new here, what do you offer?"
AI: "Welcome to KFAR Marketplace! We're Israel's only 100% vegan marketplace 
operated by the Village of Peace community in Dimona. We have 6 amazing vendors:

- Teva Deli: 46 vegan meat alternatives
- People Store: Organic groceries and bulk foods
- Queen's Cuisine: Plant-based prepared meals
- Gahn Delight: Artisanal vegan ice cream
- Garden of Light: Fresh salads and raw foods
- VOP Shop: Community merchandise

Everything is vegan, many items are kosher certified. What interests you most?"
```

### Example 2: Specific Product Query
```
User: "I need something for Shabbat dinner"
AI: "For Shabbat dinner, I recommend:

From Teva Deli:
- Vegan Schnitzel (₪28) - Perfect main dish
- Seitan Roast (₪45) - Serves 4-6

From Queen's Cuisine:
- Plant-Based Meatballs (₪38) - Great with pasta
- Vegan Kebabs (₪42) - Grilled perfection

From People Store:
- Challah Bread (₪18) - Traditional Shabbat bread
- Organic Grape Juice (₪22) - For kiddush

Would you like me to add any of these to your cart?"
```

### Example 3: Health & Nutrition
```
User: "What are the health benefits of your products?"
AI: "The Village of Peace community has been 100% vegan for over 50 years 
and has some of the lowest rates of chronic diseases in the world! 

Our products offer:
- No cholesterol (plant-based only)
- High fiber from whole foods
- Rich in vitamins and minerals
- No artificial additives
- Many organic options

Our community members don't consume alcohol or tobacco, focusing on 
holistic health. Studies have shown our lifestyle leads to increased 
longevity and vitality. 

Would you like specific nutritional information about any products?"
```

## Performance Benefits

### Speed Improvements
- **Instant Responses**: Knowledge base in memory
- **Streaming**: Users see responses as they're generated
- **Smart Caching**: Common queries cached
- **Parallel Tools**: Multiple searches simultaneously

### Accuracy Benefits
- **Verified Information**: All data from official sources
- **Real-time Updates**: Product changes reflected immediately
- **Context Awareness**: Remembers conversation history
- **Multi-source**: Combines product, vendor, and policy data

## Customization Options

### 1. Custom Knowledge Documents
```typescript
// Add custom knowledge
await kfarKnowledgeBase.updateDocument('custom-doc-1', {
  type: 'general',
  title: 'Special Event',
  content: 'Hanukkah specials available...',
});
```

### 2. Conversation Presets
```typescript
// Pre-configured conversation flows
const PRESETS = {
  firstTimeVisitor: [
    "Welcome! First time at KFAR?",
    "Let me show you our best sellers",
    "We offer free shipping over ₪300"
  ],
  returningCustomer: [
    "Welcome back!",
    "Check out what's new since your last visit",
    "Your favorite vendors have new products"
  ],
};
```

### 3. Language Adaptation
```typescript
// Multi-language support
const chat = useIntelligentChat({
  language: 'he', // Hebrew
  context: { location: 'Jerusalem' }
});

// AI responds in Hebrew with local context
```

## Best Practices

1. **Initialize Early**: Load knowledge base on app start
2. **Use Streaming**: Better perceived performance
3. **Provide Context**: Include user preferences
4. **Handle Errors**: Graceful fallbacks
5. **Track Analytics**: Monitor popular queries

## Conclusion

The KFAR Intelligent Chat System transforms your marketplace into a knowledgeable assistant that can:
- Answer any question about products, vendors, or policies
- Provide personalized recommendations
- Share community history and values
- Suggest recipes and meal ideas
- Guide users through their shopping journey

It's not just a chatbot - it's a comprehensive knowledge system that understands your entire marketplace ecosystem!