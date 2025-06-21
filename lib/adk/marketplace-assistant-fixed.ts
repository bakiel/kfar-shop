// Fixed MarketplaceAssistant with proper conversation tracking
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VOP_RECIPE_GUIDELINES, PRODUCT_KNOWLEDGE } from './vop-dietary-rules';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface AgentQuery {
  query: string;
  language?: 'en' | 'he' | 'ar';
  userId?: string;
  context?: any;
  assistantName?: string;
  gender?: 'male' | 'female';
  enableVoice?: boolean;
  conversationHistory?: string[];
}

export interface AgentResponse {
  response: string;
  audioUrl?: string;
  suggestions?: string[];
  products?: any[];
  vendors?: any[];
  metadata?: {
    intent: string;
    confidence: number;
    language: string;
  };
}

export class MarketplaceAssistant {
  private model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  });
  
  async processQuery(query: AgentQuery): Promise<AgentResponse> {
    try {
      const assistantName = query.assistantName || 'Akh Yaakov';
      const conversationHistory = query.conversationHistory || [];
      
      // CRITICAL: Check if we've greeted before by looking at BOTH user and bot messages
      const hasGreetedBefore = conversationHistory.some(msg => {
        const lowerMsg = msg.toLowerCase();
        return (
          lowerMsg.includes('shalom shalom') || 
          lowerMsg.includes('welcome to k\'far') ||
          lowerMsg.includes('welcome to kfar') ||
          (lowerMsg.includes('bot:') && lowerMsg.includes('i\'m akh'))
        );
      });
      
      // Check message patterns
      const isFirstMessage = conversationHistory.length === 0;
      const userMessage = query.query.trim().toLowerCase();
      const isSimpleGreeting = /^(hi|hello|hey|shalom|good morning|good afternoon|good evening)$/i.test(query.query.trim());
      const isFarewell = /\b(bye|goodbye|see you|thanks|thank you|todah|toda)\b/i.test(query.query);
      
      console.log('Assistant Debug:', {
        conversationLength: conversationHistory.length,
        hasGreetedBefore,
        isFirstMessage,
        isSimpleGreeting,
        lastFewMessages: conversationHistory.slice(-3)
      });
      
      // Build conversation context
      const conversationContext = conversationHistory.length > 0 
        ? `Previous conversation:\n${conversationHistory.join('\n')}\n\n`
        : '';
      
      const systemPrompt = `You are ${assistantName}, a warm and friendly assistant for K'far Vegan Marketplace in Dimona, Israel.

CONVERSATION STATE:
- This is message #${conversationHistory.length + 1} in our conversation
- Have we greeted before? ${hasGreetedBefore ? 'YES - DO NOT GREET AGAIN' : 'NO - This is first contact'}
- User just said: "${query.query}"

CRITICAL RULES - FOLLOW EXACTLY:
1. GREETING RULE: ${isFirstMessage && !hasGreetedBefore ? 
   'First message - Start with: "Shalom Shalom! Welcome to K\'far Marketplace. I\'m ' + assistantName + '."' : 
   'ONGOING CONVERSATION - NEVER say "Shalom Shalom", NEVER say "Welcome", NEVER introduce yourself again'}

2. RESPONSE RULE: ${isSimpleGreeting && hasGreetedBefore ? 
   'User said hello again - Respond warmly but DO NOT repeat the full greeting. Say something like "Hello again! How can I help you?"' :
   'Respond naturally to their specific question'}

3. FAREWELL RULE: ${isFarewell ? 
   'User is leaving - End with ONE of: "Todaraba!", "Kol Tov!", or "Yah Khai!"' : 
   'Normal response - no farewell needed'}

4. Be concise and helpful. Don't over-explain unless asked.

5. Use community expressions sparingly (not every response).

Community expressions to use occasionally:
- "Todaraba" (thank you)
- "Baruch Yah" (blessed be Yah)
- "B'ezrat Yah" (with Yah's help)

${conversationContext}

Current query: ${query.query}
Language preference: ${query.language || 'en'}`;
      
      // Generate response
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      let text = response.text();
      
      // IMPORTANT: Remove any accidental greetings in ongoing conversations
      if (hasGreetedBefore && conversationHistory.length > 0) {
        // Remove any "Shalom Shalom" or "Welcome to" that might slip through
        text = text.replace(/Shalom Shalom[!.]?\s*/gi, '');
        text = text.replace(/Welcome to K'?far.*?\.\s*/gi, '');
        text = text.replace(/I'm Akh\w* \w+\.\s*/gi, '');
        text = text.trim();
      }
      
      // Detect intent
      const intent = await this.detectIntent(query.query);
      
      return {
        response: text,
        suggestions: await this.generateSuggestions(intent),
        metadata: {
          intent,
          confidence: 0.9,
          language: query.language || 'en'
        }
      };
      
    } catch (error: any) {
      console.error('Assistant error:', error);
      return {
        response: "I apologize, I'm having technical difficulties. Please try again.",
        metadata: {
          intent: 'error',
          confidence: 0,
          language: query.language || 'en'
        }
      };
    }
  }
  
  private async detectIntent(query: string): Promise<string> {
    const intents = {
      product_search: /looking for|need|want|where can i find|do you have/i,
      recipe: /recipe|cook|make|prepare|ingredients/i,
      vendor_info: /vendor|store|shop|teva deli|people store/i,
      order: /order|buy|purchase|checkout|cart/i,
      dietary: /vegan|kosher|gluten|allergy|dietary/i,
      greeting: /^(hello|hi|shalom|hey|good morning)$/i,
      farewell: /bye|goodbye|see you|thanks|thank you/i,
      general: /.*/
    };
    
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(query)) return intent;
    }
    return 'general';
  }
  
  private async generateSuggestions(intent: string): Promise<string[]> {
    const suggestions: Record<string, string[]> = {
      product_search: ["Browse all products", "View by vendor", "See new arrivals"],
      recipe: ["View recipes", "Quick meal ideas", "Cooking tips"],
      vendor_info: ["View all vendors", "Vendor locations", "Contact info"],
      greeting: ["Browse products", "Today's specials", "About K'far"],
      farewell: ["Browse before you go", "Save for later", "Contact us"],
      general: ["Browse marketplace", "Today's specials", "About K'far"]
    };
    
    return suggestions[intent] || suggestions.general;
  }
}