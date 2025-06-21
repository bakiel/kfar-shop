// Command validation and confirmation utilities

export interface ValidationResult {
  isValid: boolean;
  needsConfirmation: boolean;
  message?: string;
  suggestions?: string[];
  confidence: number;
}

export interface CommandContext {
  intent: string;
  entities: any;
  cart?: any[];
  currentProduct?: any;
  previousCommands?: string[];
}

export class CommandValidator {
  // Validate command and determine if confirmation is needed
  validateCommand(context: CommandContext): ValidationResult {
    const { intent, entities, cart } = context;
    
    switch (intent) {
      case 'add_to_cart':
        return this.validateAddToCart(entities, context);
        
      case 'checkout':
        return this.validateCheckout(cart);
        
      case 'search_product':
        return this.validateSearch(entities);
        
      case 'browse_vendor':
        return this.validateVendorBrowse(entities);
        
      case 'unclear':
        return {
          isValid: false,
          needsConfirmation: false,
          message: "I didn't quite catch that. Could you please repeat?",
          confidence: 0.2
        };
        
      default:
        return {
          isValid: true,
          needsConfirmation: false,
          confidence: 0.8
        };
    }
  }
  
  private validateAddToCart(entities: any, context: CommandContext): ValidationResult {
    // Check if we have a product context
    if (!entities.product && !context.currentProduct) {
      return {
        isValid: false,
        needsConfirmation: false,
        message: "I need to know which product to add. What would you like to add to your cart?",
        confidence: 0.3
      };
    }
    
    // Validate quantity
    const quantity = entities.quantity || 1;
    if (quantity > 10) {
      return {
        isValid: true,
        needsConfirmation: true,
        message: `You want to add ${quantity} items. Is that correct?`,
        confidence: 0.7
      };
    }
    
    // If adding multiple without specifying product clearly
    if (quantity > 1 && !entities.product && context.currentProduct) {
      return {
        isValid: true,
        needsConfirmation: true,
        message: `Add ${quantity} ${context.currentProduct.name} to your cart?`,
        confidence: 0.8
      };
    }
    
    return {
      isValid: true,
      needsConfirmation: false,
      confidence: 0.9
    };
  }
  
  private validateCheckout(cart?: any[]): ValidationResult {
    if (!cart || cart.length === 0) {
      return {
        isValid: false,
        needsConfirmation: false,
        message: "Your cart is empty. Would you like to add some items first?",
        confidence: 0.9
      };
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Always confirm checkout
    return {
      isValid: true,
      needsConfirmation: true,
      message: `Ready to checkout with ${totalItems} items for ₪${totalPrice.toFixed(2)}?`,
      confidence: 0.95
    };
  }
  
  private validateSearch(entities: any): ValidationResult {
    // Check if search is too vague
    if (!entities.product && !entities.category && !entities.vendor && !entities.dietary) {
      return {
        isValid: true,
        needsConfirmation: false,
        message: "What kind of products are you looking for?",
        suggestions: ["vegan options", "breakfast items", "desserts", "Teva Deli products"],
        confidence: 0.5
      };
    }
    
    // Price range validation
    if (entities.priceRange) {
      const { min, max } = entities.priceRange;
      if (min > max) {
        return {
          isValid: false,
          needsConfirmation: false,
          message: "The price range seems incorrect. Could you clarify?",
          confidence: 0.3
        };
      }
    }
    
    return {
      isValid: true,
      needsConfirmation: false,
      confidence: 0.85
    };
  }
  
  private validateVendorBrowse(entities: any): ValidationResult {
    const validVendors = [
      'teva-deli',
      'peoples-store',
      'queens-cuisine',
      'garden-of-light',
      'gahn-delight',
      'vop-shop'
    ];
    
    if (entities.vendor && !validVendors.includes(entities.vendor)) {
      return {
        isValid: false,
        needsConfirmation: false,
        message: `I'm not familiar with that vendor. We have: Teva Deli, People's Store, Queen's Cuisine, Garden of Light, Gahn Delight, and VOP Shop.`,
        suggestions: validVendors,
        confidence: 0.4
      };
    }
    
    return {
      isValid: true,
      needsConfirmation: false,
      confidence: 0.9
    };
  }
  
  // Generate confirmation prompt
  generateConfirmationPrompt(intent: string, entities: any, context?: any): string {
    switch (intent) {
      case 'add_to_cart':
        const quantity = entities.quantity || 1;
        const product = entities.product || context?.currentProduct?.name || 'this item';
        return `Add ${quantity} ${product} to your cart?`;
        
      case 'checkout':
        return `Proceed to checkout?`;
        
      case 'clear_cart':
        return `Clear all items from your cart?`;
        
      default:
        return `Confirm this action?`;
    }
  }
  
  // Check if response is affirmative
  isAffirmativeResponse(response: string): boolean {
    const affirmatives = [
      'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'correct', 
      'right', 'confirm', 'go ahead', 'proceed', 'do it'
    ];
    
    const lower = response.toLowerCase();
    return affirmatives.some(word => lower.includes(word));
  }
  
  // Check if response is negative
  isNegativeResponse(response: string): boolean {
    const negatives = [
      'no', 'nope', 'cancel', 'stop', 'wait', 'wrong', 
      'incorrect', 'nevermind', 'forget it', "don't"
    ];
    
    const lower = response.toLowerCase();
    return negatives.some(word => lower.includes(word));
  }
}

// Singleton instance
export const commandValidator = new CommandValidator();