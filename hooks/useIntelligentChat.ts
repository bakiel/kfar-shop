// hooks/useIntelligentChat.ts
import { useChat } from 'ai/react';
import { useState, useCallback, useEffect } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { kfarKnowledgeBase } from '@/lib/ai/knowledge-base';

interface ChatContext {
  userName?: string;
  preferences?: {
    dietary?: string[];
    favorite_vendors?: string[];
    allergies?: string[];
  };
  orderHistory?: any[];
  location?: string;
}

interface KnowledgeResult {
  type: 'product' | 'vendor' | 'policy' | 'faq' | 'community' | 'recipe';
  title: string;
  content: string;
  metadata?: any;
}

export function useIntelligentChat(initialContext?: ChatContext) {
  const { cart, getCartTotal } = useCart();
  const [context, setContext] = useState<ChatContext>(initialContext || {});
  const [knowledgeResults, setKnowledgeResults] = useState<KnowledgeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Initialize knowledge base
  useEffect(() => {
    kfarKnowledgeBase.initialize().catch(console.error);
  }, []);

  // Use Vercel AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
  } = useChat({
    api: '/api/intelligent-chat',
    body: {
      context,
    },
    onResponse: (response) => {
      // Check headers for knowledge usage
      const knowledgeEnabled = response.headers.get('X-Knowledge-Enabled');
      console.log('Knowledge-enabled response:', knowledgeEnabled);
    },
    onFinish: (message) => {
      // Extract any knowledge results from tool calls
      if (message.toolInvocations) {
        const results: KnowledgeResult[] = [];
        
        for (const invocation of message.toolInvocations) {
          if (invocation.toolName === 'searchKnowledge' && invocation.result?.results) {
            results.push(...invocation.result.results);
          }
        }
        
        if (results.length > 0) {
          setKnowledgeResults(results);
        }
      }
    },
  });

  // Enhanced submit that includes cart context
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Update context with current cart info
    const updatedContext = {
      ...context,
      cartTotal: getCartTotal(),
      cartItems: cart.length,
    };
    
    setContext(updatedContext);
    originalSubmit(e);
  }, [originalSubmit, context, cart, getCartTotal]);

  // Quick knowledge search
  const searchKnowledge = useCallback(async (query: string, type?: KnowledgeResult['type']) => {
    setIsSearching(true);
    try {
      const results = await kfarKnowledgeBase.search(query, { type, limit: 5 });
      setKnowledgeResults(results.map(doc => ({
        type: doc.type,
        title: doc.title,
        content: doc.content,
        metadata: doc.metadata,
      })));
      return results;
    } catch (error) {
      console.error('Knowledge search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Preset questions for different topics
  const askAbout = useCallback(async (topic: string) => {
    const questions: Record<string, string> = {
      shipping: "What are your shipping options and costs?",
      returns: "What is your return policy?",
      kosher: "Which products are kosher certified?",
      community: "Tell me about the Village of Peace community",
      vendors: "Tell me about all the vendors in the marketplace",
      health: "What are the health benefits of your vegan products?",
      recipes: "Can you suggest some recipes using your products?",
      deals: "What special offers do you have today?",
      new: "What new products have you added recently?",
      visit: "Can I visit the Village of Peace?",
    };

    const question = questions[topic] || `Tell me about ${topic}`;
    await append({ role: 'user', content: question });
  }, [append]);

  // Get vendor-specific information
  const getVendorInfo = useCallback(async (vendorName: string) => {
    await append({
      role: 'user',
      content: `Tell me everything about ${vendorName}, including their products and specialties.`,
    });
  }, [append]);

  // Get product recommendations
  const getRecommendations = useCallback(async (criteria: {
    priceRange?: { min: number; max: number };
    dietary?: string[];
    mealType?: string;
    vendor?: string;
  }) => {
    let query = "I'm looking for ";
    
    if (criteria.dietary && criteria.dietary.length > 0) {
      query += `${criteria.dietary.join(', ')} `;
    }
    
    if (criteria.mealType) {
      query += `something for ${criteria.mealType} `;
    }
    
    if (criteria.priceRange) {
      query += `between ₪${criteria.priceRange.min} and ₪${criteria.priceRange.max} `;
    }
    
    if (criteria.vendor) {
      query += `from ${criteria.vendor}`;
    }
    
    await append({ role: 'user', content: query });
  }, [append]);

  // Update user context
  const updateContext = useCallback((updates: Partial<ChatContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  // Get conversation summary
  const getConversationSummary = useCallback(() => {
    const topics = new Set<string>();
    const mentionedProducts = new Set<string>();
    const mentionedVendors = new Set<string>();
    
    messages.forEach(msg => {
      // Extract topics from user messages
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        if (content.includes('ship')) topics.add('shipping');
        if (content.includes('return')) topics.add('returns');
        if (content.includes('kosher')) topics.add('dietary');
        if (content.includes('community') || content.includes('village')) topics.add('community');
      }
      
      // Extract mentions from assistant responses
      if (msg.role === 'assistant' && msg.toolInvocations) {
        msg.toolInvocations.forEach((inv: any) => {
          if (inv.result?.products) {
            inv.result.products.forEach((p: any) => mentionedProducts.add(p.name));
          }
          if (inv.result?.vendor) {
            mentionedVendors.add(inv.result.vendor);
          }
        });
      }
    });
    
    return {
      messageCount: messages.length,
      topics: Array.from(topics),
      mentionedProducts: Array.from(mentionedProducts),
      mentionedVendors: Array.from(mentionedVendors),
      hasCartActivity: messages.some(m => m.content.toLowerCase().includes('cart')),
    };
  }, [messages]);

  // Clear knowledge results
  const clearKnowledgeResults = useCallback(() => {
    setKnowledgeResults([]);
  }, []);

  return {
    // Chat state
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    
    // Chat controls
    reload,
    stop,
    append,
    
    // Knowledge features
    searchKnowledge,
    knowledgeResults,
    isSearching,
    clearKnowledgeResults,
    
    // Helper functions
    askAbout,
    getVendorInfo,
    getRecommendations,
    updateContext,
    getConversationSummary,
    
    // Context
    context,
  };
}

// Preset conversation starters
export const CONVERSATION_STARTERS = [
  {
    icon: '🛒',
    text: "What's popular today?",
    action: 'popular',
  },
  {
    icon: '📦',
    text: 'Shipping info',
    action: 'shipping',
  },
  {
    icon: '🏘️',
    text: 'About the community',
    action: 'community',
  },
  {
    icon: '👨‍🍳',
    text: 'Recipe ideas',
    action: 'recipes',
  },
  {
    icon: '🏪',
    text: 'Our vendors',
    action: 'vendors',
  },
  {
    icon: '✡️',
    text: 'Kosher products',
    action: 'kosher',
  },
  {
    icon: '🌱',
    text: 'Health benefits',
    action: 'health',
  },
  {
    icon: '🎉',
    text: "Today's deals",
    action: 'deals',
  },
];

// Knowledge search suggestions
export const KNOWLEDGE_CATEGORIES = [
  { value: 'product', label: 'Products', icon: '📦' },
  { value: 'vendor', label: 'Vendors', icon: '🏪' },
  { value: 'policy', label: 'Policies', icon: '📋' },
  { value: 'faq', label: 'FAQs', icon: '❓' },
  { value: 'community', label: 'Community', icon: '🏘️' },
  { value: 'recipe', label: 'Recipes', icon: '🍽️' },
];