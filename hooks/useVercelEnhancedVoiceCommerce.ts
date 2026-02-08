// hooks/useVercelEnhancedVoiceCommerce.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useVercelAIVoice } from '@/lib/ai/vercel-ai-integration';
import { performanceTracker } from '@/lib/utils/performance-tracker';
import { AGENT_INTRO } from '@/config/voice';

interface Product {
  id: string;
  name: string;
  price: number;
  vendor?: string;
  vendorId?: string;
  image?: string;
  description?: string;
}

export function useVercelEnhancedVoiceCommerce() {
  const router = useRouter();
  const { addToCart, cart, getCartTotal } = useCart();
  const { processCommand, setVoice, clearHistory } = useVercelAIVoice();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [streamingText, setStreamingText] = useState<string>('');
  const [currentVoice, setCurrentVoice] = useState<'yaakov' | 'daniella'>('daniella');
  
  // Initialize performance tracking
  useEffect(() => {
    const id = performanceTracker.startSession();
    setSessionId(id);
    performanceTracker.loadMetrics();
    
    return () => {
      performanceTracker.endSession();
    };
  }, []);

  // Handle voice change
  const changeVoice = useCallback((voice: 'yaakov' | 'daniella') => {
    setCurrentVoice(voice);
    setVoice(voice, 'en');
  }, [setVoice]);

  // Process voice command with Vercel AI SDK
  const processVoiceCommand = useCallback(async (transcript: string) => {
    setLastCommand(transcript);
    setIsProcessing(true);
    setStreamingText('');
    
    // Start performance tracking
    performanceTracker.startTimer('total');
    performanceTracker.startTimer('ai');
    
    try {
      const result = await processCommand(transcript, {
        streaming: true,
        onPartialResponse: (text) => {
          // Update UI with streaming response
          setStreamingText(text);
        },
      });
      
      performanceTracker.endTimer('ai');
      
      // Process tool calls (product searches, cart actions)
      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const toolCall of result.toolCalls) {
          switch (toolCall.toolName) {
            case 'searchProducts':
              if (toolCall.result?.products) {
                setSearchResults(toolCall.result.products);
                if (toolCall.result.products.length > 0) {
                  setCurrentProduct(toolCall.result.products[0]);
                }
              }
              break;
              
            case 'addToCart':
              if (toolCall.result?.success && toolCall.args) {
                // Find the actual product to add
                const productToAdd = searchResults.find(p => p.id === toolCall.args.productId);
                if (productToAdd) {
                  addToCart({
                    id: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.price,
                    quantity: toolCall.args.quantity || 1,
                    vendor: productToAdd.vendor || '',
                    vendorId: productToAdd.vendorId || '',
                    image: productToAdd.image || '',
                  });
                }
              }
              break;
              
            case 'getCartInfo':
              // Cart info is already available through context
              break;
              
            case 'checkDeals':
              if (toolCall.result?.deals) {
                setSearchResults(toolCall.result.deals);
                if (toolCall.result.deals.length > 0) {
                  setCurrentProduct(toolCall.result.deals[0]);
                }
              }
              break;
          }
        }
      }
      
      // Track successful command
      performanceTracker.trackCommand(
        transcript,
        result.toolCalls?.[0]?.toolName || 'general',
        { response: result.response },
        true,
        0.9
      );
      
      // Handle navigation if mentioned in response
      if (result.response.toLowerCase().includes('checkout') && getCartTotal() > 0) {
        setTimeout(() => router.push('/checkout'), 2000);
      }
      
    } catch (error) {
      console.error('Voice command processing error:', error);
      performanceTracker.trackError('system', error.message, { transcript });
      setStreamingText("I'm having trouble understanding. Could you try again?");
    } finally {
      performanceTracker.endTimer('total');
      
      // Update cart value for tracking
      if (cart) {
        const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        performanceTracker.updateCartValue(totalValue);
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        setStreamingText('');
      }, 1000);
    }
  }, [processCommand, addToCart, cart, getCartTotal, router]);

  // Quick action handlers
  const handleQuickAction = useCallback(async (action: string) => {
    switch (action) {
      case 'deals':
        await processVoiceCommand("What's on sale today?");
        break;
      case 'cart':
        await processVoiceCommand("What's in my cart?");
        break;
      case 'bestsellers':
        await processVoiceCommand("Show me your best sellers");
        break;
      case 'help':
        // Use existing intro messages
        const intro = AGENT_INTRO.en[currentVoice];
        setStreamingText(intro);
        break;
    }
  }, [processVoiceCommand, currentVoice]);

  // Get voice suggestions based on context
  const getVoiceSuggestions = useCallback(() => {
    if (currentProduct) {
      return [
        "Add to cart",
        "Tell me more about this",
        "Show similar products",
        "What's the price?"
      ];
    }
    
    if (cart && cart.length > 0) {
      return [
        "Checkout",
        "What's my total?",
        "Remove last item",
        "Continue shopping"
      ];
    }
    
    return [
      "What's on sale?",
      "Show me vegan ice cream",
      "Best sellers",
      "I need hummus"
    ];
  }, [currentProduct, cart]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return performanceTracker.getAggregateMetrics();
  }, []);
  
  // Get performance report
  const getPerformanceReport = useCallback(() => {
    return performanceTracker.getPerformanceReport();
  }, []);

  // Clear conversation when component unmounts
  useEffect(() => {
    return () => {
      clearHistory();
    };
  }, [clearHistory]);

  return {
    // Core functions
    processCommand: processVoiceCommand,
    handleQuickAction,
    changeVoice,
    
    // State
    isProcessing,
    lastCommand,
    currentProduct,
    searchResults,
    streamingText,
    currentVoice,
    
    // Helpers
    getVoiceSuggestions,
    getPerformanceMetrics,
    getPerformanceReport,
    
    // Session
    sessionId,
  };
}

// Feature flag to enable/disable Vercel AI integration
export function useSmartVoiceCommerce() {
  const enableVercelAI = process.env.NEXT_PUBLIC_ENABLE_VERCEL_AI === 'true';
  
  // Dynamically import the appropriate hook
  if (enableVercelAI) {
    return useVercelEnhancedVoiceCommerce();
  } else {
    // Fall back to existing implementation
    const { useVoiceCommerce } = require('./useVoiceCommerce');
    return useVoiceCommerce();
  }
}