// kfar-marketplace-app/lib/adk/vop-aware-assistant.ts
import { MarketplaceAssistant } from './marketplace-assistant';

interface VOPComplianceCheck {
  isCompliant: boolean;
  issues: string[];
  alternatives?: string[];
}

export class VOPAwareAssistant extends MarketplaceAssistant {
  private vopRules = {
    forbiddenIngredients: [
      'black pepper', 'coffee', 'caffeine', 'black tea', 'alcohol',
      'white sugar', 'refined sugar', 'eggs', 'dairy', 'milk', 'cheese',
      'butter', 'honey', 'meat', 'fish', 'poultry', 'gelatin'
    ],
    preferredSweeteners: [
      'coconut sugar', 'brown sugar', 'raw sugar', 'dates', 
      'maple syrup', 'agave nectar'
    ],
    approvedOils: {
      highHeat: ['cold-pressed sunflower oil', 'avocado oil'],
      lowHeat: ['cold-pressed olive oil', 'cold-pressed coconut oil'],
      noHeat: ['cold-pressed olive oil', 'flax oil', 'hemp oil']
    },
    encouragedIngredients: [
      'nutritional yeast', 'turmeric', 'ginger', 'garlic', 'cumin',
      'paprika', 'coriander', 'fresh herbs', 'herbal salt'
    ]
  };

  async processQuery(query: any): Promise<any> {
    const baseResponse = await super.processQuery(query);
    
    // Check if user is asking about VOP compliance
    if (query.query.toLowerCase().includes('vop') || 
        query.query.toLowerCase().includes('village of peace')) {
      
      return this.addVOPGuidance(baseResponse, query);
    }
    
    return baseResponse;
  }

  private addVOPGuidance(response: any, query: any): any {
    const queryLower = query.query.toLowerCase();
    
    // Provide VOP-specific guidance
    if (queryLower.includes('compliant') || queryLower.includes('allowed')) {
      response.response = this.getVOPComplianceInfo();
      response.suggestions = [
        "View VOP-approved products",
        "Learn about forbidden ingredients",
        "See meal planning guide"
      ];
    }
    
    return response;
  }
  private getVOPComplianceInfo(): string {
    return `Village of Peace follows strict dietary guidelines for spiritual and physical purity:

✅ **Allowed:**
• All plant-based whole foods
• Cold-pressed oils (sunflower for cooking, olive for cold dishes)
• Natural sweeteners (coconut sugar preferred, dates, maple syrup)
• Nutritional yeast (highly encouraged!)
• Healing spices: turmeric, ginger, garlic, cumin, paprika
• Herbal teas and fresh juices

❌ **Not Allowed:**
• No animal products (meat, dairy, eggs, honey)
• No black pepper (use white pepper or paprika instead)
• No caffeine (coffee, black tea)
• No alcohol or stimulants
• No white/refined sugar
• No processed foods or GMOs

🙏 Remember: Food is spiritual nourishment. Choose pure, whole ingredients with intention.`;
  }

  checkProductCompliance(product: any): VOPComplianceCheck {
    const issues: string[] = [];
    const description = (product.description || '').toLowerCase();
    const ingredients = product.ingredients || [];
    
    // Check for forbidden ingredients
    for (const forbidden of this.vopRules.forbiddenIngredients) {
      if (description.includes(forbidden) || 
          ingredients.some((ing: string) => ing.toLowerCase().includes(forbidden))) {
        issues.push(`Contains ${forbidden} (not VOP compliant)`);
      }
    }
    
    // Check oil compliance
    if (description.includes('fried') && description.includes('olive oil')) {
      issues.push('Fried with olive oil (use high-heat oils for frying)');
    }
    
    // Check for processed foods
    if (['artificial', 'processed', 'refined'].some(word => description.includes(word))) {
      issues.push('Contains processed/artificial ingredients');
    }
    
    return {
      isCompliant: issues.length === 0,
      issues,
      alternatives: issues.length > 0 ? this.getSuggestedAlternatives(issues) : undefined
    };
  }

  private getSuggestedAlternatives(issues: string[]): string[] {
    const alternatives: string[] = [];
    
    if (issues.some(i => i.includes('black pepper'))) {
      alternatives.push('Try white pepper, paprika, or cayenne instead');
    }
    if (issues.some(i => i.includes('coffee'))) {
      alternatives.push('Try herbal coffee substitutes or chicory root');
    }
    if (issues.some(i => i.includes('white sugar'))) {
      alternatives.push('Use coconut sugar, dates, or maple syrup');
    }
    
    return alternatives;
  }
}