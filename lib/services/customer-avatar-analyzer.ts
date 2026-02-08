import { OpenRouterVisionService } from './openrouter-vision-service';

interface AvatarAnalysis {
  imageId: string;
  suggestedName: string;
  description: string;
  characteristics: {
    apparentAge: string;
    gender: string;
    hairColor: string;
    clothing: string;
    expression: string;
    accessories: string[];
  };
  personalityTraits: string[];
  suggestedPreferences: {
    dietary: string[];
    shoppingHabits: string[];
    favoriteCategories: string[];
  };
}

export class CustomerAvatarAnalyzer {
  private visionService: OpenRouterVisionService;

  constructor() {
    this.visionService = new OpenRouterVisionService();
  }

  async analyzeAvatar(imagePath: string, imageId: string): Promise<AvatarAnalysis> {
    const prompt = `You are analyzing a customer avatar image for a marketplace platform. Please provide a detailed analysis in JSON format with the following structure:

{
  "suggestedName": "A culturally appropriate Israeli name that fits the person's appearance",
  "description": "A brief, respectful description of the person",
  "characteristics": {
    "apparentAge": "age range (e.g., '25-35', '40-50')",
    "gender": "apparent gender",
    "hairColor": "hair color",
    "clothing": "style of clothing",
    "expression": "facial expression or mood",
    "accessories": ["list of visible accessories like glasses, jewelry, etc."]
  },
  "personalityTraits": ["3-5 personality traits that seem to match their appearance"],
  "suggestedPreferences": {
    "dietary": ["suggested dietary preferences based on appearance/style"],
    "shoppingHabits": ["suggested shopping habits"],
    "favoriteCategories": ["suggested product categories they might prefer"]
  }
}

Be respectful and avoid stereotypes. Focus on observable characteristics only.`;

    try {
      const analysisText = await this.visionService.analyzeImage(imagePath, prompt);
      
      // Parse the JSON response
      let analysis: any;
      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        // Fallback analysis
        analysis = this.createFallbackAnalysis(imageId);
      }

      return {
        imageId,
        ...analysis
      };
    } catch (error) {
      console.error('Avatar analysis error:', error);
      return this.createFallbackAnalysis(imageId);
    }
  }

  private createFallbackAnalysis(imageId: string): AvatarAnalysis {
    // Fallback names based on image ID
    const fallbackNames = [
      { name: 'Sarah Cohen', gender: 'female' },
      { name: 'David Levi', gender: 'male' },
      { name: 'Rachel Green', gender: 'female' },
      { name: 'Yossi Mizrahi', gender: 'male' },
      { name: 'Maya Shapiro', gender: 'female' },
      { name: 'Eli Goldstein', gender: 'male' }
    ];

    const index = parseInt(imageId.replace(/\D/g, '')) - 1;
    const fallback = fallbackNames[index % fallbackNames.length];

    return {
      imageId,
      suggestedName: fallback.name,
      description: `A friendly ${fallback.gender === 'female' ? 'woman' : 'man'} who shops at KFAR marketplace`,
      characteristics: {
        apparentAge: '30-40',
        gender: fallback.gender,
        hairColor: 'brown',
        clothing: 'casual',
        expression: 'friendly',
        accessories: []
      },
      personalityTraits: ['friendly', 'conscientious', 'health-conscious'],
      suggestedPreferences: {
        dietary: ['vegetarian-friendly'],
        shoppingHabits: ['weekly shopping', 'quality-focused'],
        favoriteCategories: ['bakery', 'fresh-produce', 'dairy']
      }
    };
  }

  async analyzeAllAvatars(): Promise<AvatarAnalysis[]> {
    const avatarImages = [
      '/images/customer-onboarding/1.jpg',
      '/images/customer-onboarding/2.jpg',
      '/images/customer-onboarding/3.jpg',
      '/images/customer-onboarding/4.jpg',
      '/images/customer-onboarding/5.jpg',
      '/images/customer-onboarding/6.jpg'
    ];

    const analyses: AvatarAnalysis[] = [];

    for (const imagePath of avatarImages) {
      const imageId = imagePath.match(/(\d+)\.jpg$/)?.[1] || '0';
      const analysis = await this.analyzeAvatar(imagePath, imageId);
      analyses.push(analysis);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return analyses;
  }

  // Generate a complete customer profile based on avatar analysis
  generateCustomerProfile(analysis: AvatarAnalysis, customerId: string) {
    const tierAssignment = this.assignLoyaltyTier(analysis);
    
    return {
      id: customerId,
      name: analysis.suggestedName,
      email: `${analysis.suggestedName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: '+972-50-' + Math.floor(Math.random() * 9000000 + 1000000),
      avatar: `/images/customer-onboarding/${analysis.imageId}.jpg`,
      memberSince: this.generateMemberSince(),
      loyaltyTier: tierAssignment.tier,
      points: tierAssignment.points,
      preferences: {
        dietary: analysis.suggestedPreferences.dietary,
        allergies: this.generateAllergies(analysis),
        favoriteCategories: analysis.suggestedPreferences.favoriteCategories
      },
      stats: {
        totalOrders: Math.floor(Math.random() * 50) + 10,
        totalSpent: Math.floor(Math.random() * 3000) + 500,
        savedByDiscounts: Math.floor(Math.random() * 500) + 100
      },
      personalityTraits: analysis.personalityTraits,
      description: analysis.description
    };
  }

  private assignLoyaltyTier(analysis: AvatarAnalysis) {
    // Assign tier based on personality traits and preferences
    const traits = analysis.personalityTraits.join(' ').toLowerCase();
    
    if (traits.includes('premium') || traits.includes('sophisticated')) {
      return { tier: 'platinum' as const, points: 10000 + Math.floor(Math.random() * 5000) };
    } else if (traits.includes('quality') || traits.includes('discerning')) {
      return { tier: 'gold' as const, points: 5000 + Math.floor(Math.random() * 5000) };
    } else if (traits.includes('regular') || traits.includes('practical')) {
      return { tier: 'silver' as const, points: 2000 + Math.floor(Math.random() * 3000) };
    } else {
      return { tier: 'bronze' as const, points: 500 + Math.floor(Math.random() * 1500) };
    }
  }

  private generateAllergies(analysis: AvatarAnalysis): string[] {
    // Generate realistic allergies based on dietary preferences
    const possibleAllergies = ['nuts', 'dairy', 'gluten', 'eggs', 'shellfish', 'soy'];
    const numAllergies = Math.random() < 0.3 ? 1 : 0; // 30% chance of having an allergy
    
    if (numAllergies === 0) return [];
    
    const randomIndex = Math.floor(Math.random() * possibleAllergies.length);
    return [possibleAllergies[randomIndex]];
  }

  private generateMemberSince(): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = 2022 + Math.floor(Math.random() * 3); // 2022-2024
    const month = months[Math.floor(Math.random() * months.length)];
    return `${month} ${year}`;
  }
}

// Export pre-analyzed customer profiles for immediate use
export const ANALYZED_CUSTOMER_PROFILES = [
  {
    id: 'cust_001',
    imageId: '1',
    name: 'Sarah Cohen',
    description: 'A professional woman in her early 30s with a warm, approachable demeanor',
    loyaltyTier: 'gold' as const,
    points: 3250,
    preferences: {
      dietary: ['vegan', 'gluten-free'],
      allergies: ['nuts'],
      favoriteCategories: ['bakery', 'prepared-meals', 'desserts']
    }
  },
  {
    id: 'cust_002',
    imageId: '2',
    name: 'David Levi',
    description: 'A family-oriented man in his 40s who values quality and tradition',
    loyaltyTier: 'platinum' as const,
    points: 12500,
    preferences: {
      dietary: ['kosher'],
      allergies: [],
      favoriteCategories: ['meat', 'wine', 'dairy']
    }
  },
  {
    id: 'cust_003',
    imageId: '3',
    name: 'Rachel Green',
    description: 'A health-conscious woman in her late 20s with an active lifestyle',
    loyaltyTier: 'silver' as const,
    points: 2100,
    preferences: {
      dietary: ['vegetarian', 'organic'],
      allergies: ['dairy'],
      favoriteCategories: ['fresh-produce', 'health-foods', 'beverages']
    }
  },
  {
    id: 'cust_004',
    imageId: '4',
    name: 'Yossi Mizrahi',
    description: 'A tech professional in his mid-30s who appreciates convenience',
    loyaltyTier: 'gold' as const,
    points: 4500,
    preferences: {
      dietary: [],
      allergies: ['gluten'],
      favoriteCategories: ['ready-meals', 'snacks', 'beverages']
    }
  },
  {
    id: 'cust_005',
    imageId: '5',
    name: 'Maya Shapiro',
    description: 'A young mother focused on healthy options for her family',
    loyaltyTier: 'gold' as const,
    points: 5800,
    preferences: {
      dietary: ['organic', 'sugar-free'],
      allergies: [],
      favoriteCategories: ['baby-food', 'fresh-produce', 'dairy']
    }
  },
  {
    id: 'cust_006',
    imageId: '6',
    name: 'Eli Goldstein',
    description: 'A retired professor who enjoys gourmet cooking',
    loyaltyTier: 'platinum' as const,
    points: 15000,
    preferences: {
      dietary: ['gourmet'],
      allergies: ['shellfish'],
      favoriteCategories: ['specialty-foods', 'wine', 'cheese']
    }
  }
];