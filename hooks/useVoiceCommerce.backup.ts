import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { AGENT_INTRO } from '@/config/voice';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches?: string[]) => void;
  response: (matches?: string[]) => string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  vendor?: string;
  vendorId?: string;
  image?: string;
  description?: string;
}

export function useVoiceCommerce() {
  const router = useRouter();
  // Make cart optional to prevent errors when context is not available
  let cartContext;
  try {
    cartContext = useCart();
  } catch (e) {
    // Cart context not available
    cartContext = {
      addToCart: () => {},
      cart: [],
      getCartTotal: () => 0
    };
  }
  const { addToCart, cart, getCartTotal } = cartContext;
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  
  // Audio reference to manage overlapping
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Voice feedback function using ElevenLabs V3 ONLY - NO FALLBACK
  const speak = useCallback(async (text: string, voice: 'yaakov' | 'daniella' = 'daniella') => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Cancel browser speech synthesis if any
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      console.log('🎤 Speaking with ElevenLabs V3:', { text: text.substring(0, 50), voice });
      
      const response = await fetch('/api/voice/v3-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice,
          stream: false // Use non-streaming for simplicity
        })
      });

      if (!response.ok) {
        throw new Error(`V3 API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audio) {
        // Play the ElevenLabs audio
        console.log('✅ Playing ElevenLabs V3 audio');
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;
        
        audio.onended = () => {
          audioRef.current = null;
        };
        
        await audio.play();
      } else {
        // DO NOT FALLBACK - Log error instead
        console.error('❌ ElevenLabs V3 failed - NO AUDIO PLAYED', data);
        throw new Error('V3 API did not return audio');
      }
    } catch (error) {
      console.error('❌ Voice synthesis error - NO FALLBACK:', error);
      // DO NOT USE BROWSER TTS - Just log the error
    }
  }, []);

  // Product search
  const searchProducts = useCallback(async (query: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        setSearchResults(data.products);
        setCurrentProduct(data.products[0]);
        return data.products;
      }
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Command handlers
  const commands: VoiceCommand[] = [
    // Product search
    {
      pattern: /(?:show me|find|search for|I need|I want) (.+)/i,
      action: async (matches) => {
        const query = matches?.[1] || '';
        const products = await searchProducts(query);
        if (products.length > 0) {
          speak(`Found ${products[0].name} for ${products[0].price} shekels. Want to add it to your cart?`);
        } else {
          speak(`Sorry, I couldn't find ${query}. Try another search?`);
        }
      },
      response: (matches) => `Searching for ${matches?.[1]}...`
    },
    
    // Add to cart
    {
      pattern: /(?:add|yes|add it|add to cart|buy it)/i,
      action: () => {
        if (currentProduct) {
          addToCart({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: 1,
            vendor: currentProduct.vendor || '',
            vendorId: currentProduct.vendorId || '',
            image: currentProduct.image || ''
          });
          speak(`Added ${currentProduct.name} to your cart. Your total is ${getCartTotal() + currentProduct.price} shekels. Anything else?`);
        } else {
          speak("Please search for a product first.");
        }
      },
      response: () => 'Adding to cart...'
    },
    
    // Show deals
    {
      pattern: /(?:what's on sale|show deals|specials|discounts)/i,
      action: async () => {
        const deals = await searchProducts('special');
        if (deals.length > 0) {
          speak(`Today's special: ${deals[0].name} for only ${deals[0].price} shekels!`);
        } else {
          speak("Check back later for today's specials!");
        }
      },
      response: () => "Checking today's deals..."
    },
    
    // Best sellers
    {
      pattern: /(?:best sellers|popular|top products)/i,
      action: async () => {
        const products = await searchProducts('best');
        if (products.length > 0) {
          speak(`Our best seller is ${products[0].name} from ${products[0].vendor}. Only ${products[0].price} shekels!`);
        }
      },
      response: () => 'Finding best sellers...'
    },
    
    // Cart info
    {
      pattern: /(?:what's in my cart|show cart|cart total)/i,
      action: () => {
        const total = getCartTotal();
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (itemCount > 0) {
          speak(`You have ${itemCount} items in your cart. Total: ${total} shekels.`);
        } else {
          speak("Your cart is empty. What would you like to buy?");
        }
      },
      response: () => 'Checking your cart...'
    },
    
    // Checkout
    {
      pattern: /(?:checkout|pay|complete order|finish)/i,
      action: () => {
        const total = getCartTotal();
        if (total > 0) {
          speak(`Your total is ${total} shekels. Redirecting to checkout...`);
          router.push('/checkout');
        } else {
          speak("Your cart is empty. Add some items first!");
        }
      },
      response: () => 'Going to checkout...'
    },
    
    // Price filter
    {
      pattern: /(?:under|less than|below) (\d+)/i,
      action: async (matches) => {
        const maxPrice = parseInt(matches?.[1] || '50');
        const products = await searchProducts(`under ${maxPrice}`);
        if (products.length > 0) {
          speak(`Found ${products[0].name} for ${products[0].price} shekels. Want to see more?`);
        }
      },
      response: (matches) => `Finding products under ${matches?.[1]} shekels...`
    },
    
    // Quick reorder
    {
      pattern: /(?:my usual|repeat order|order again)/i,
      action: () => {
        // This would connect to order history
        speak("I'll help you reorder your favorites. What did you have last time?");
      },
      response: () => 'Looking up your usual order...'
    },
    
    // Help command
    {
      pattern: /(?:help|what can you do|commands|how to use|capabilities)/i,
      action: () => {
        // Get the appropriate intro based on current voice (defaulting to English Daniella)
        const intro = AGENT_INTRO.en.daniella;
        speak(intro, 'daniella');
      },
      response: () => 'Let me tell you what I can do...'
    }
  ];

  // Process voice command
  const processCommand = useCallback((transcript: string) => {
    setLastCommand(transcript);
    
    // Find matching command
    for (const command of commands) {
      const matches = transcript.match(command.pattern);
      if (matches) {
        // Don't speak the immediate response - let the action handle all speech
        // This prevents double voice playback
        console.log('Processing command:', transcript);
        
        // Execute action (which will handle speaking)
        command.action(Array.from(matches));
        return true;
      }
    }
    
    // No match found
    speak("I didn't catch that. Try saying 'show me vegan products' or 'what's on sale?'");
    return false;
  }, [commands, speak]);

  // Get voice suggestions based on context
  const getVoiceSuggestions = useCallback(() => {
    if (currentProduct) {
      return [
        "Add to cart",
        "Show me more like this",
        "What else do they have?"
      ];
    }
    
    if (cart && cart.length > 0) {
      return [
        "Checkout",
        "What's in my cart?",
        "Continue shopping"
      ];
    }
    
    return [
      "What's on sale?",
      "Show me best sellers",
      "I need hummus"
    ];
  }, [currentProduct, cart]);

  return {
    processCommand,
    isProcessing,
    lastCommand,
    currentProduct,
    searchResults,
    speak,
    getVoiceSuggestions
  };
}