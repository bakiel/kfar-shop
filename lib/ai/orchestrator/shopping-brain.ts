/**
 * Shopping Orchestrator (Brain) for KFAR AI Shopping Assistant
 * Uses Gemini 2.0 Flash for function calling and intent detection
 * Follows JASPER orchestrator-mediated multi-agent pattern
 */

import { GoogleGenerativeAI, GenerativeModel, Content, FunctionCall } from '@google/generative-ai';
import { searchAgent } from '../agents/search-agent';
import { cartAgent, CartItem } from '../agents/cart-agent';
import { SHOPPING_TOOLS, ShoppingToolName } from '../tools/shopping-tools';
import {
  ShoppingEventType,
  UserInput,
  AssistantResponse,
  ProductResult,
  CartSummary,
} from '../events/shopping-events';

// Configuration
const GEMINI_MODEL = 'gemini-2.0-flash';

// System prompt for the shopping assistant
const SYSTEM_PROMPT = `You are KFAR, a friendly and knowledgeable AI shopping assistant for the KFAR Marketplace - the Village of Peace community marketplace in Dimona, Israel.

Your role is to help customers:
- Find products they're looking for (vegan food, clothing, home goods)
- Add items to their cart
- Get recommendations
- Answer questions about products and vendors

Personality:
- Warm and helpful, like a knowledgeable friend at a local market
- Enthusiastic about vegan/plant-based products
- Brief but informative responses
- Celebrate the community aspect of KFAR

Available Vendors:
- Teva Deli: Premium vegan deli meats, schnitzels, shawarma
- Garden of Light: Fresh salads, spreads, healthy options
- Queens Cuisine: Caribbean-inspired vegan cuisine
- Gahn Delight: Desserts, ice cream, chocolates
- VOP Shop: Community apparel and merchandise
- People Store: Bulk foods, pantry items

Guidelines:
- Always use the search_products tool when users ask about products
- Use add_to_cart when they want to buy something
- Use get_recommendations for suggestions
- Keep responses concise (2-3 sentences max)
- If showing products, let the UI display them - don't list them in text
- Be helpful with dietary questions (vegan, kosher, gluten-free)

Language:
- Respond in the same language the user speaks
- If Hebrew, respond in Hebrew
- If English, respond in English`;

export class ShoppingOrchestrator {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    this.initializeModel();
  }

  private initializeModel() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not found. AI features will be limited.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
        tools: SHOPPING_TOOLS,
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(input: UserInput, cart: CartItem[] = []): Promise<AssistantResponse> {
    // Fallback if Gemini not available
    if (!this.model) {
      return this.handleFallback(input, cart);
    }

    try {
      // Build conversation history
      const contents = this.buildConversationContents(input);

      // Generate response with function calling
      const result = await this.model.generateContent({
        contents,
        tools: SHOPPING_TOOLS,
      });

      const response = result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        return this.handleFallback(input, cart);
      }

      // Check for function calls
      const functionCalls = this.extractFunctionCalls(candidates[0].content);

      if (functionCalls.length > 0) {
        // Execute function calls and get results
        const toolResults = await this.executeFunctionCalls(functionCalls, cart);

        // Generate final response with tool results
        return this.generateFinalResponse(input, toolResults, cart);
      }

      // No function calls - return text response
      const text = candidates[0].content.parts
        .filter(part => 'text' in part)
        .map(part => (part as { text: string }).text)
        .join('');

      return {
        text,
        intent: this.detectIntent(input.message),
        suggestions: this.generateSuggestions(input.language),
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return this.handleError(input.language, error);
    }
  }

  /**
   * Build conversation contents for Gemini
   */
  private buildConversationContents(input: UserInput): Content[] {
    const contents: Content[] = [];

    // Add conversation history
    if (input.conversationHistory && input.conversationHistory.length > 0) {
      for (const msg of input.conversationHistory.slice(-10)) { // Last 10 messages
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: input.message }],
    });

    return contents;
  }

  /**
   * Extract function calls from response
   */
  private extractFunctionCalls(content: Content): FunctionCall[] {
    const functionCalls: FunctionCall[] = [];

    for (const part of content.parts) {
      if ('functionCall' in part && part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }

    return functionCalls;
  }

  /**
   * Execute function calls and collect results
   */
  private async executeFunctionCalls(
    functionCalls: FunctionCall[],
    cart: CartItem[]
  ): Promise<{
    toolName: ShoppingToolName;
    args: Record<string, unknown>;
    result: unknown;
  }[]> {
    const results = [];

    for (const call of functionCalls) {
      const toolName = call.name as ShoppingToolName;
      const args = call.args as Record<string, unknown>;
      let result: unknown;

      try {
        switch (toolName) {
          case 'search_products':
            result = await searchAgent.search(
              args.query as string,
              {
                category: args.category as string | undefined,
                vendor: args.vendor as string | undefined,
                dietary: args.dietary as string[] | undefined,
                priceMax: args.priceMax as number | undefined,
              }
            );
            break;

          case 'add_to_cart':
            result = await cartAgent.addToCart(
              args.productId as string,
              (args.quantity as number) || 1,
              cart
            );
            break;

          case 'view_cart':
            result = await cartAgent.getCartSummary(cart);
            break;

          case 'remove_from_cart':
            result = await cartAgent.removeFromCart(args.productId as string, cart);
            break;

          case 'update_cart_quantity':
            result = await cartAgent.updateQuantity(
              args.productId as string,
              args.quantity as number,
              cart
            );
            break;

          case 'get_product_details':
            result = await searchAgent.getProductDetails(args.productId as string);
            break;

          case 'browse_vendor':
            result = await searchAgent.browseVendor(
              args.vendorId as string,
              args.category as string | undefined
            );
            break;

          case 'get_recommendations':
            // TODO: Implement recommendation agent
            result = await searchAgent.search(
              args.category as string || 'popular',
              {}
            );
            break;

          case 'list_vendors':
            result = await searchAgent.listVendors();
            break;

          case 'list_categories':
            result = await searchAgent.listCategories();
            break;

          default:
            result = { error: `Unknown tool: ${toolName}` };
        }
      } catch (error) {
        console.error(`Error executing ${toolName}:`, error);
        result = { error: `Failed to execute ${toolName}` };
      }

      results.push({ toolName, args, result });
    }

    return results;
  }

  /**
   * Generate final response incorporating tool results
   */
  private async generateFinalResponse(
    input: UserInput,
    toolResults: { toolName: ShoppingToolName; args: Record<string, unknown>; result: unknown }[],
    cart: CartItem[]
  ): Promise<AssistantResponse> {
    let products: ProductResult[] | undefined;
    let cartSummary: CartSummary | undefined;
    let responseText = '';
    let intent: ShoppingEventType = ShoppingEventType.UNKNOWN;

    for (const { toolName, result } of toolResults) {
      switch (toolName) {
        case 'search_products':
        case 'browse_vendor':
        case 'get_recommendations':
          products = result as ProductResult[];
          intent = ShoppingEventType.SEARCH_REQUESTED;
          if (products.length > 0) {
            responseText = input.language === 'he'
              ? `מצאתי ${products.length} מוצרים עבורך:`
              : `I found ${products.length} products for you:`;
          } else {
            responseText = input.language === 'he'
              ? 'לא מצאתי מוצרים התואמים לחיפוש. נסה מילות חיפוש אחרות.'
              : "I couldn't find products matching your search. Try different keywords.";
          }
          break;

        case 'add_to_cart':
          const addResult = result as { success: boolean; message: string; messageHe?: string; summary?: CartSummary };
          cartSummary = addResult.summary;
          intent = ShoppingEventType.ADD_TO_CART;
          responseText = input.language === 'he'
            ? addResult.messageHe || addResult.message
            : addResult.message;
          break;

        case 'view_cart':
          cartSummary = result as CartSummary;
          intent = ShoppingEventType.VIEW_CART;
          responseText = cartAgent.describeCart(cart, input.language);
          break;

        case 'remove_from_cart':
        case 'update_cart_quantity':
          const cartResult = result as { success: boolean; message: string; messageHe?: string; summary?: CartSummary };
          cartSummary = cartResult.summary;
          intent = toolName === 'remove_from_cart'
            ? ShoppingEventType.REMOVE_FROM_CART
            : ShoppingEventType.UPDATE_QUANTITY;
          responseText = input.language === 'he'
            ? cartResult.messageHe || cartResult.message
            : cartResult.message;
          break;

        case 'get_product_details':
          const product = result as ProductResult | null;
          if (product) {
            products = [product];
            intent = ShoppingEventType.PRODUCT_DETAILS;
            responseText = input.language === 'he'
              ? `הנה פרטי המוצר עבור ${product.name}:`
              : `Here are the details for ${product.name}:`;
          } else {
            responseText = input.language === 'he'
              ? 'המוצר לא נמצא.'
              : 'Product not found.';
          }
          break;

        case 'list_vendors':
          intent = ShoppingEventType.VENDOR_BROWSE;
          const vendors = result as { id: string; name: string; description?: string }[];
          responseText = input.language === 'he'
            ? `יש לנו ${vendors.length} חנויות במרקטפלייס:`
            : `We have ${vendors.length} vendors in our marketplace:`;
          break;

        case 'list_categories':
          intent = ShoppingEventType.CATEGORY_BROWSE;
          responseText = input.language === 'he'
            ? 'הנה הקטגוריות הזמינות:'
            : 'Here are the available categories:';
          break;
      }
    }

    return {
      text: responseText,
      products,
      cartSummary,
      intent,
      suggestions: this.generateSuggestions(input.language),
    };
  }

  /**
   * Detect intent from message (fallback when no function call)
   */
  private detectIntent(message: string): ShoppingEventType {
    const lower = message.toLowerCase();

    // Greeting patterns
    if (/^(hi|hello|hey|shalom|שלום|היי|בוקר טוב|ערב טוב)/.test(lower)) {
      return ShoppingEventType.GREETING;
    }

    // Cart patterns
    if (/cart|עגלה|basket|סל/.test(lower)) {
      if (/add|הוסף/.test(lower)) return ShoppingEventType.ADD_TO_CART;
      if (/remove|הסר|delete|מחק/.test(lower)) return ShoppingEventType.REMOVE_FROM_CART;
      return ShoppingEventType.VIEW_CART;
    }

    // Search patterns
    if (/find|search|show|looking for|מחפש|הראה|חפש/.test(lower)) {
      return ShoppingEventType.SEARCH_REQUESTED;
    }

    // Help patterns
    if (/help|עזרה|how|איך/.test(lower)) {
      return ShoppingEventType.HELP_REQUESTED;
    }

    return ShoppingEventType.MESSAGE_RECEIVED;
  }

  /**
   * Generate contextual suggestions
   */
  private generateSuggestions(language: 'en' | 'he'): string[] {
    const suggestions = language === 'he'
      ? [
          'הראה לי מוצרי טבע דלי',
          'אני מחפש חטיפים טבעוניים',
          'מה יש בעגלה שלי?',
          'המלץ על קינוחים',
        ]
      : [
          'Show me Teva Deli products',
          'I\'m looking for vegan snacks',
          'What\'s in my cart?',
          'Recommend some desserts',
        ];

    // Return 3 random suggestions
    return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  /**
   * Handle fallback when Gemini is not available
   */
  private async handleFallback(input: UserInput, _cart: CartItem[]): Promise<AssistantResponse> {
    const message = input.message.toLowerCase();

    // Try to match basic patterns
    if (/search|find|show|looking|מחפש|הראה|חפש|dessert|ice cream|snack|burger|cheese/.test(message)) {
      // Extract search term (simplified)
      const searchTerm = message
        .replace(/(search|find|show|looking for|מחפש|הראה|חפש)/gi, '')
        .trim() || message;

      if (searchTerm) {
        try {
          const products = await searchAgent.search(searchTerm);
          if (products.length > 0) {
            return {
              text: input.language === 'he'
                ? `מצאתי ${products.length} מוצרים עבורך:`
                : `I found ${products.length} products for you:`,
              products,
              intent: ShoppingEventType.SEARCH_REQUESTED,
              suggestions: this.generateSuggestions(input.language),
            };
          }
        } catch (e) {
          console.error('Fallback search failed:', e);
        }

        return {
          text: input.language === 'he'
            ? 'לא מצאתי מוצרים התואמים לחיפוש. נסה מילות חיפוש אחרות.'
            : "I couldn't find products matching your search. Try different keywords.",
          intent: ShoppingEventType.SEARCH_REQUESTED,
          suggestions: this.generateSuggestions(input.language),
        };
      }
    }

    // Default fallback
    return {
      text: input.language === 'he'
        ? 'שלום! אני עוזר הקניות של KFAR. איך אוכל לעזור לך היום? אתה יכול לחפש מוצרים, להוסיף לעגלה, או לבקש המלצות.'
        : "Hello! I'm the KFAR shopping assistant. How can I help you today? You can search for products, add to cart, or ask for recommendations.",
      intent: ShoppingEventType.GREETING,
      suggestions: this.generateSuggestions(input.language),
    };
  }

  /**
   * Handle errors gracefully
   */
  private handleError(language: 'en' | 'he', error: unknown): AssistantResponse {
    console.error('Orchestrator error:', error);

    return {
      text: language === 'he'
        ? 'מצטער, נתקלתי בבעיה. אנא נסה שוב.'
        : "Sorry, I encountered an issue. Please try again.",
      intent: ShoppingEventType.UNKNOWN,
      suggestions: this.generateSuggestions(language),
    };
  }
}

// Singleton instance
export const shoppingOrchestrator = new ShoppingOrchestrator();
