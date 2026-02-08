// AI Service for enhanced voice understanding
interface AIResponse {
  intent: string;
  entities: any;
  enhancedQuery?: string;
  suggestedResponse?: string;
  confidence?: number;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private conversationHistory: Array<{role: string, content: string}> = [];
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async enhanceCommand(userInput: string, context?: any): Promise<AIResponse> {
    // Try with retry mechanism
    return this.enhanceCommandWithRetry(userInput, context);
  }
  
  private async enhanceCommandWithRetry(userInput: string, context?: any, attempt = 0): Promise<AIResponse> {
    const maxAttempts = 2;
    
    try {
      // Apply phonetic corrections
      const correctedInput = this.applyPhoneticCorrections(userInput);
      
      // Log if correction was made
      if (correctedInput !== userInput.toLowerCase()) {
        console.log(`🔧 Phonetic correction: "${userInput}" → "${correctedInput}"`);
      }
      
      // Add to conversation history
      this.conversationHistory.push({ role: 'user', content: userInput });
      
      // Keep only last 10 messages for context
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://kfarmarket.com',
          'X-Title': 'KFAR Voice Assistant'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001', // Upgraded from free tier
          messages: [
            {
              role: 'system',
              content: `You are an intelligent voice shopping assistant for KFAR marketplace, an Israeli organic food market.
              
              AVAILABLE PRODUCTS INCLUDE:
              - Teva Deli: Vegan seitan products, schnitzels, tofu dishes, kubbeh, meatballs (30-50 shekels)
              - People's Store: Organic grains, tahini, coconut products, health foods (15-40 shekels)
              - Queen's Cuisine: Burgers, shawarma, prepared meals (35-60 shekels)
              - Garden of Light: Salads, smoothies, healthy wraps (25-45 shekels)
              - Gahn Delight: Ice cream, desserts, parfaits (20-35 shekels)
              - VOP Shop: Gifts, books, apparel (50-200 shekels)
              
              Extract intent and entities from natural speech. Be flexible with understanding.
              
              CRITICAL: Respond with ONLY a valid JSON object. Do NOT use markdown formatting, code blocks, or wrap the JSON in backticks.
              Return the raw JSON directly.
              ${attempt > 0 ? 'IMPORTANT: Previous attempt failed due to formatting. Return ONLY the JSON object with no additional text or formatting.' : ''}
              {
                "intent": "search_product|add_to_cart|show_deals|show_cart|checkout|browse_vendor|ask_about|greeting|unclear",
                "entities": {
                  "product": "product name or type",
                  "vendor": "vendor name if mentioned", 
                  "category": "food category",
                  "dietary": "vegan|gluten-free|organic if mentioned",
                  "quantity": "number if mentioned",
                  "priceRange": {"min": number, "max": number} if mentioned
                },
                "enhancedQuery": "optimized search query",
                "suggestedResponse": "natural response to say back",
                "confidence": 0.0-1.0
              }
              
              Current context: ${JSON.stringify(context || {})}
              Recent conversation: ${this.conversationHistory.slice(-4).map(m => m.content).join(' -> ')}
              
              EXAMPLES:
              - "I'm hungry" → intent: "browse_vendor", suggestedResponse: "What kind of food are you in the mood for? We have vegan options from Teva Deli, fresh salads, or desserts."
              - "Something for breakfast" → intent: "search_product", category: "breakfast", enhancedQuery: "bread hummus tahini"
              - "What do you have?" → intent: "browse_vendor", suggestedResponse: "We have 6 vendors: Teva Deli for vegan food, People's Store for organic groceries, Queen's Cuisine for meals, Garden of Light for healthy options, Gahn Delight for desserts, and VOP Shop for gifts."
              - "Add two" → intent: "add_to_cart", quantity: 2 (uses context)
              - "What's that?" → intent: "ask_about" (needs context of current product)
              - "Something cheap" → intent: "search_product", priceRange: {"min": 0, "max": 30}
              - "Show me Teva Deli" → intent: "browse_vendor", vendor: "teva-deli"`
            },
            {
              role: 'user',
              content: correctedInput  // Use phonetically corrected input
            }
          ],
          temperature: 0.3,
          max_tokens: 300,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }
      
      const data = await response.json();
      let content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('No content in AI response');
        return this.enhancedBasicParse(userInput);
      }
      
      try {
        // Clean markdown formatting if present
        content = this.cleanJsonResponse(content);
        
        const result = JSON.parse(content);
        // Add to conversation history
        if (result.suggestedResponse) {
          this.conversationHistory.push({ role: 'assistant', content: result.suggestedResponse });
        }
        return result;
      } catch (e) {
        console.error('Failed to parse AI response:', content);
        console.error('Parse error:', e);
        // Try one more time with aggressive cleaning
        try {
          const aggressivelyCleaned = content
            .replace(/^[^{]*/, '') // Remove everything before first {
            .replace(/[^}]*$/, ''); // Remove everything after last }
          const result = JSON.parse(aggressivelyCleaned);
          return result;
        } catch (e2) {
          console.error('Second parse attempt failed');
          // If we have more attempts, retry with more explicit instructions
          if (attempt < maxAttempts - 1) {
            console.log(`Retrying with attempt ${attempt + 1}`);
            return this.enhanceCommandWithRetry(userInput, context, attempt + 1);
          }
          return this.enhancedBasicParse(userInput);
        }
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      // Retry if we have attempts left
      if (attempt < maxAttempts - 1) {
        console.log(`Retrying due to error, attempt ${attempt + 1}`);
        return this.enhanceCommandWithRetry(userInput, context, attempt + 1);
      }
      // Fallback to enhanced basic parsing
      return this.enhancedBasicParse(userInput);
    }
  }
  
  private enhancedBasicParse(input: string): any {
    const lower = input.toLowerCase();
    
    // Greeting detection
    if (lower.match(/^(hi|hello|hey|shalom|good morning|good evening)/)) {
      return { 
        intent: 'greeting', 
        entities: {},
        suggestedResponse: "Hello! Welcome to KFAR marketplace. What can I help you find today?",
        confidence: 0.9
      };
    }
    
    // Vendor browsing
    if (lower.includes('teva deli') || lower.includes('teva')) {
      return { 
        intent: 'browse_vendor', 
        entities: { vendor: 'teva-deli' },
        enhancedQuery: 'teva deli',
        suggestedResponse: "Teva Deli specializes in vegan products. Would you like to see their seitan schnitzels, tofu dishes, or vegan meatballs?",
        confidence: 0.8
      };
    }
    
    // Dietary preferences
    if (lower.includes('vegan')) {
      return { 
        intent: 'search_product', 
        entities: { dietary: 'vegan' },
        enhancedQuery: 'vegan',
        suggestedResponse: "I'll show you our vegan options. Teva Deli has great vegan schnitzels and tofu dishes.",
        confidence: 0.8
      };
    }
    
    // Price-based searches
    if (lower.includes('cheap') || lower.includes('affordable')) {
      return { 
        intent: 'search_product', 
        entities: { priceRange: { min: 0, max: 30 } },
        enhancedQuery: 'under 30',
        suggestedResponse: "Looking for budget-friendly options under 30 shekels.",
        confidence: 0.7
      };
    }
    
    // Category searches
    if (lower.includes('breakfast')) {
      return { 
        intent: 'search_product', 
        entities: { category: 'breakfast' },
        enhancedQuery: 'bread hummus',
        suggestedResponse: "For breakfast, we have fresh bread, hummus, and tahini.",
        confidence: 0.8
      };
    }
    
    if (lower.includes('dessert') || lower.includes('sweet')) {
      return { 
        intent: 'search_product', 
        entities: { category: 'dessert', vendor: 'gahn-delight' },
        enhancedQuery: 'ice cream dessert',
        suggestedResponse: "Gahn Delight has delicious ice cream and desserts. Let me show you their options.",
        confidence: 0.8
      };
    }
    
    // Basic intent detection
    if (lower.includes('sale') || lower.includes('special') || lower.includes('deal')) {
      return { 
        intent: 'show_deals', 
        entities: {},
        suggestedResponse: "Let me check today's special deals for you.",
        confidence: 0.9
      };
    }
    
    if (lower.includes('cart') && !lower.includes('add')) {
      return { 
        intent: 'show_cart', 
        entities: {},
        suggestedResponse: "I'll show you what's in your cart.",
        confidence: 0.9
      };
    }
    
    if (lower.includes('add') || lower.includes('buy')) {
      return { 
        intent: 'add_to_cart', 
        entities: {},
        confidence: 0.8
      };
    }
    
    if (lower.includes('checkout') || lower.includes('pay')) {
      return { 
        intent: 'checkout', 
        entities: {},
        suggestedResponse: "Let's proceed to checkout.",
        confidence: 0.9
      };
    }
    
    // Default to search with better understanding
    const searchTerms = input.replace(/show me|find|search for|i need|i want|get me/gi, '').trim();
    return {
      intent: 'search_product',
      entities: { product: searchTerms },
      enhancedQuery: searchTerms,
      suggestedResponse: `Searching for ${searchTerms}...`,
      confidence: 0.6
    };
  }
  
  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }
  
  // Get conversation context
  getContext() {
    return this.conversationHistory.slice(-6);
  }
  
  // Clean JSON response from markdown formatting
  private cleanJsonResponse(content: string): string {
    // Remove markdown code blocks
    let cleaned = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    // Remove any leading/trailing quotes
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Unescape if needed
    if (cleaned.includes('\\"')) {
      cleaned = cleaned.replace(/\\"/g, '"');
    }
    
    return cleaned;
  }
  
  // Apply phonetic corrections for common misrecognitions
  applyPhoneticCorrections(input: string): string {
    const corrections: Record<string, string> = {
      'satan': 'seitan',
      'say tan': 'seitan',
      'satan schnitzel': 'seitan schnitzel',
      'humus': 'hummus',
      'homos': 'hummus',
      'tahini': 'tahini',
      'tehina': 'tahini',
      'shwarma': 'shawarma',
      'schwarma': 'shawarma',
      'kube': 'kubbeh',
      'cuba': 'kubbeh',
      'people store': 'peoples store',
      'people\'s store': 'peoples store',
      'gun delight': 'gahn delight',
      'gone delight': 'gahn delight'
    };
    
    let corrected = input.toLowerCase();
    
    // Apply corrections
    for (const [wrong, right] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    }
    
    return corrected;
  }
}

// Export singleton instance
export const aiService = new AIService(process.env.OPENROUTER_API_KEY || '');