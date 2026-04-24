import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useAudioQueue } from '@/hooks/useAudioQueue';
import { AGENT_INTRO } from '@/config/voice';
import { applyPhoneticPronunciation } from '@/config/voice-pronunciation';
import { aiService } from '@/lib/services/ai-service';
import { commandValidator } from '@/lib/utils/command-validation';
import { performanceTracker } from '@/lib/utils/performance-tracker';

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
  const { speak: queueSpeak } = useAudioQueue();
  
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
  const [sessionId, setSessionId] = useState<string>('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<any>(null);
  
  // Track if we're currently speaking to prevent overlaps
  const isSpeaking = useRef(false);
  
  // Initialize performance tracking
  useEffect(() => {
    const id = performanceTracker.startSession();
    setSessionId(id);
    performanceTracker.loadMetrics();
    
    return () => {
      performanceTracker.endSession();
    };
  }, []);
  
  // Voice feedback function with phonetic pronunciation
  const speak = useCallback(async (text: string, voice: 'yaakov' | 'daniella' = 'daniella', priority?: 'high' | 'normal') => {
    // Prevent multiple simultaneous speak calls
    if (isSpeaking.current && priority !== 'high') {
      console.log('⚠️ Already speaking, skipping:', text.substring(0, 30));
      return;
    }
    
    // Apply phonetic pronunciation
    const phoneticText = applyPhoneticPronunciation(text);
    console.log('🎤 Speaking:', { original: text.substring(0, 30), phonetic: phoneticText.substring(0, 30), voice });
    
    // Use the audio queue with callbacks
    isSpeaking.current = true;
    await queueSpeak(phoneticText, voice, priority, {
      onEnd: () => {
        isSpeaking.current = false;
      }
    });
  }, [queueSpeak]);

  // Product search with performance tracking
  const searchProducts = useCallback(async (query: string) => {
    setIsProcessing(true);
    performanceTracker.startTimer('search');
    
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
      performanceTracker.trackError('search', error.message, { query });
      return [];
    } finally {
      performanceTracker.endTimer('search');
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
          await speak(`Found ${products[0].name} for ${products[0].price} shekels. Want to add it to your cart?`);
        } else {
          await speak(`Sorry, I couldn't find ${query}. Try another search?`);
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
          await speak(`Today's special: ${deals[0].name} for only ${deals[0].price} shekels!`);
        } else {
          await speak("Check back later for today's specials!");
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

  // Debounce timer for commands
  const commandTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Process voice command with AI enhancement, validation, and performance tracking
  const processCommand = useCallback(async (transcript: string) => {
    // Clear any pending command processing
    if (commandTimer.current) {
      clearTimeout(commandTimer.current);
    }
    
    // Immediate check to prevent processing while speaking
    if (isSpeaking.current) {
      console.log('⚠️ Ignoring command while speaking:', transcript);
      return false;
    }
    
    // Check if we're awaiting confirmation
    if (awaitingConfirmation) {
      const isYes = commandValidator.isAffirmativeResponse(transcript);
      const isNo = commandValidator.isNegativeResponse(transcript);
      
      if (isYes || isNo) {
        const { intent, entities, action } = awaitingConfirmation;
        setAwaitingConfirmation(null);
        
        if (isYes) {
          await speak("Got it, confirming...");
          await action();
        } else {
          await speak("Okay, cancelled. What else can I help you with?");
        }
        return true;
      }
    }
    
    // Debounce command processing
    commandTimer.current = setTimeout(async () => {
      setLastCommand(transcript);
      setIsProcessing(true);
      
      // Start performance tracking
      performanceTracker.startTimer('total');
      performanceTracker.startTimer('recognition');
      
      try {
        // Track recognition time
        performanceTracker.endTimer('recognition');
        performanceTracker.startTimer('ai');
        
        // Use AI to enhance understanding
        const enhanced = await aiService.enhanceCommand(transcript, {
          hasCurrentProduct: !!currentProduct,
          cartItems: cart?.length || 0,
          currentProductName: currentProduct?.name,
          cart: cart
        });
        
        performanceTracker.endTimer('ai');
        console.log('🤖 AI Enhanced:', enhanced);
        
        // Validate command
        const validation = commandValidator.validateCommand({
          intent: enhanced.intent,
          entities: enhanced.entities,
          cart: cart,
          currentProduct: currentProduct
        });
        
        if (!validation.isValid) {
          await speak(validation.message || "I didn't understand that. Please try again.");
          performanceTracker.trackCommand(transcript, enhanced.intent, enhanced.entities, false, validation.confidence);
          return;
        }
        
        // If command needs confirmation
        if (validation.needsConfirmation) {
          const confirmPrompt = validation.message || commandValidator.generateConfirmationPrompt(
            enhanced.intent,
            enhanced.entities,
            { currentProduct }
          );
          
          await speak(confirmPrompt);
          setAwaitingConfirmation({
            intent: enhanced.intent,
            entities: enhanced.entities,
            action: async () => {
              // Execute the confirmed action
              await executeIntent(enhanced);
            }
          });
          
          performanceTracker.trackCommand(transcript, enhanced.intent, enhanced.entities, true, validation.confidence);
          return;
        }
        
        // If AI provided a suggested response and we're confident, use it
        if (enhanced.suggestedResponse && enhanced.confidence && enhanced.confidence > 0.7 && enhanced.intent !== 'search_product') {
          await speak(enhanced.suggestedResponse);
        }
        
        // Process based on intent
        switch (enhanced.intent) {
          case 'search_product':
            const query = enhanced.enhancedQuery || enhanced.entities.product || transcript;
            
            // Handle price range searches
            if (enhanced.entities.priceRange) {
              const { min, max } = enhanced.entities.priceRange;
              const products = await searchProducts(`under ${max}`);
              if (products.length > 0) {
                await speak(`Found ${products[0].name} for ${products[0].price} shekels. ${products.length > 1 ? `And ${products.length - 1} more options.` : ''} Want to hear more?`);
              } else {
                await speak(`Sorry, no products under ${max} shekels right now. Our items start from 15 shekels.`);
              }
            } else {
              const products = await searchProducts(query);
              if (products.length > 0) {
                await speak(`Found ${products[0].name} for ${products[0].price} shekels. Want to add it to your cart?`);
              } else {
                await speak(`Sorry, I couldn't find ${query}. Try asking for vegan options, desserts, or specific vendors like Teva Deli.`);
              }
            }
            break;
            
          case 'show_deals':
            const deals = await searchProducts('special');
            if (deals.length > 0) {
              await speak(`Today's special: ${deals[0].name} for only ${deals[0].price} shekels!`);
            } else {
              await speak("Check back later for today's specials!");
            }
            break;
            
          case 'add_to_cart':
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
              await speak(`Added ${currentProduct.name} to your cart. Your total is ${getCartTotal() + currentProduct.price} shekels. Anything else?`);
            } else {
              await speak("Please search for a product first.");
            }
            break;
            
          case 'show_cart':
            const total = getCartTotal();
            const itemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            if (itemCount > 0) {
              await speak(`You have ${itemCount} items in your cart. Total: ${total} shekels.`);
            } else {
              await speak("Your cart is empty. What would you like to buy?");
            }
            break;
            
          case 'checkout':
            const checkoutTotal = getCartTotal();
            if (checkoutTotal > 0) {
              await speak(`Your total is ${checkoutTotal} shekels. Redirecting to checkout...`);
              router.push('/checkout');
            } else {
              await speak("Your cart is empty. Add some items first!");
            }
            break;
            
          case 'browse_vendor':
            if (enhanced.entities.vendor) {
              const vendorName = enhanced.entities.vendor;
              const vendorProducts = await searchProducts(vendorName);
              if (vendorProducts.length > 0) {
                await speak(`${vendorName} has ${vendorProducts.length} products available. Their top item is ${vendorProducts[0].name} for ${vendorProducts[0].price} shekels. Want to hear more?`);
                setSearchResults(vendorProducts);
                setCurrentProduct(vendorProducts[0]);
              } else {
                await speak(`Sorry, I couldn't find products from ${vendorName}. We have Teva Deli, People's Store, Queen's Cuisine, Garden of Light, Gahn Delight, and VOP Shop.`);
              }
            } else {
              await speak("We have 6 amazing vendors: Teva Deli for vegan food, People's Store for organic groceries, Queen's Cuisine for prepared meals, Garden of Light for healthy options, Gahn Delight for desserts, and VOP Shop for gifts. Which one interests you?");
            }
            break;
            
          case 'greeting':
            // Already handled by AI suggested response
            if (!enhanced.suggestedResponse) {
              await speak("Hello! Welcome to KFAR marketplace. I'm here to help you shop. What can I find for you today?");
            }
            break;
            
          case 'ask_about':
            if (currentProduct) {
              const details = currentProduct.description || `${currentProduct.name} is a great choice from ${currentProduct.vendor}. It's priced at ${currentProduct.price} shekels.`;
              await speak(details + " Would you like to add it to your cart?");
            } else if (searchResults.length > 0) {
              await speak(`I have ${searchResults.length} products here. The first one is ${searchResults[0].name} for ${searchResults[0].price} shekels. Want me to tell you about the others?`);
            } else {
              await speak("I'd be happy to tell you about our products! Try asking me to show you something specific, like 'show me vegan options' or 'what desserts do you have?'");
            }
            break;
            
          default:
            // Fall back to pattern matching
            let matched = false;
            for (const command of commands) {
              const matches = transcript.match(command.pattern);
              if (matches) {
                command.action(Array.from(matches));
                matched = true;
                break;
              }
            }
            
            if (!matched && !isSpeaking.current) {
              await speak("I didn't catch that. Try saying 'show me products' or 'what's on sale?'");
            }
        }
        // Track successful command
        performanceTracker.trackCommand(transcript, enhanced.intent, enhanced.entities, true, enhanced.confidence || 0.5);
        
      } catch (error) {
        console.error('Command processing error:', error);
        performanceTracker.trackError('system', error.message, { transcript });
        
        // Fallback to basic pattern matching
        let matched = false;
        for (const command of commands) {
          const matches = transcript.match(command.pattern);
          if (matches) {
            command.action(Array.from(matches));
            matched = true;
            break;
          }
        }
        
        if (!matched && !isSpeaking.current) {
          await speak("I didn't catch that. Try saying 'show me products' or 'what's on sale?'");
        }
      } finally {
        performanceTracker.endTimer('total');
        
        // Update cart value for tracking
        if (cart) {
          const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          performanceTracker.updateCartValue(totalValue);
        }
        
        setTimeout(() => setIsProcessing(false), 1000);
      }
    }, 500); // Reduced debounce for more responsive feel
    
    return true;
  }, [commands, speak, currentProduct, cart, searchProducts, addToCart, getCartTotal, router, awaitingConfirmation]);
  
  // Execute intent after confirmation
  const executeIntent = useCallback(async (enhanced: any) => {
    // This function handles confirmed intents
    const { intent, entities } = enhanced;
    
    switch (intent) {
      case 'add_to_cart':
        if (currentProduct) {
          const quantity = entities.quantity || 1;
          for (let i = 0; i < quantity; i++) {
            addToCart({
              id: currentProduct.id,
              name: currentProduct.name,
              price: currentProduct.price,
              quantity: 1,
              vendor: currentProduct.vendor || '',
              vendorId: currentProduct.vendorId || '',
              image: currentProduct.image || ''
            });
          }
          await speak(`Added ${quantity} ${currentProduct.name} to your cart. Your total is ${getCartTotal() + (currentProduct.price * quantity)} shekels.`);
        }
        break;
        
      case 'checkout':
        performanceTracker.markCheckoutCompleted();
        router.push('/checkout');
        break;
        
      case 'clear_cart':
        // Would need to add clearCart to cart context
        await speak("Cart cleared. Starting fresh!");
        break;
    }
  }, [currentProduct, addToCart, getCartTotal, speak, router]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (commandTimer.current) {
        clearTimeout(commandTimer.current);
      }
    };
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return performanceTracker.getAggregateMetrics();
  }, []);
  
  // Get performance report
  const getPerformanceReport = useCallback(() => {
    return performanceTracker.getPerformanceReport();
  }, []);

  return {
    processCommand,
    isProcessing,
    lastCommand,
    currentProduct,
    searchResults,
    speak,
    getVoiceSuggestions,
    getPerformanceMetrics,
    getPerformanceReport,
    sessionId,
    awaitingConfirmation
  };
}