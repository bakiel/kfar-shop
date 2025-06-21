/**
 * VOP (Village of Peace) Dietary Compliance Service
 * Ensures all products meet community dietary standards
 * Based on 50+ years of vegan living principles
 */

// VOP Clothing & Apparel Guidelines
const VOP_CLOTHING_GUIDELINES = {
  // Natural fabrics preferred
  naturalFabrics: [
    'cotton', 'organic cotton', 'linen', 'hemp', 'bamboo', 'wool', 'silk',
    'jute', 'ramie', 'modal', 'tencel', 'lyocell', 'natural fiber'
  ],
  
  // Synthetic materials to avoid or minimize
  syntheticMaterials: [
    'polyester', 'nylon', 'acrylic', 'spandex', 'elastane', 'rayon',
    'polyamide', 'polypropylene', 'synthetic', 'plastic'
  ],
  
  // Modest fashion keywords
  modestKeywords: [
    'modest', 'long sleeve', 'full coverage', 'knee length', 'ankle length',
    'high neck', 'loose fit', 'relaxed fit', 'comfortable', 'appropriate',
    'traditional', 'conservative', 'dignified', 'respectful'
  ],
  
  // Non-modest indicators
  nonModestKeywords: [
    'mini', 'micro', 'crop top', 'low cut', 'revealing', 'tight fit',
    'bodycon', 'sheer', 'see through', 'backless', 'strapless'
  ],
  
  // Ethical production
  ethicalKeywords: [
    'fair trade', 'ethically made', 'handmade', 'artisan', 'sustainable',
    'eco-friendly', 'organic certified', 'gots certified', 'locally made',
    'small batch', 'zero waste', 'upcycled', 'recycled'
  ],
  
  // Preferred certifications
  certifications: [
    'GOTS', 'Fair Trade Certified', 'OEKO-TEX', 'Cradle to Cradle',
    'B Corp', 'Organic Content Standard', 'Global Recycled Standard'
  ]
};

// VOP Dietary Guidelines
const VOP_GUIDELINES = {
  // Non-permitted ingredients (100% plant-based requirement)
  prohibited: [
    // Meat & Poultry
    'meat', 'beef', 'pork', 'lamb', 'veal', 'chicken', 'turkey', 'duck', 'goose',
    'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto',
    
    // Seafood
    'fish', 'salmon', 'tuna', 'shrimp', 'lobster', 'crab', 'oyster', 'clam',
    'anchovy', 'sardine', 'caviar', 'roe',
    
    // Dairy Products
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'kefir', 'ghee',
    'whey', 'casein', 'lactose', 'curd', 'paneer', 'mozzarella', 'cheddar',
    
    // Eggs
    'egg', 'albumin', 'albumen', 'mayonnaise', 'meringue',
    
    // Animal-Derived Ingredients
    'gelatin', 'collagen', 'keratin', 'lanolin', 'lard', 'tallow', 'suet',
    'bone', 'marrow', 'cartilage', 'shellac', 'carmine', 'cochineal',
    'pepsin', 'rennet', 'isinglass', 'vitamin d3 from wool',
    
    // Hidden Animal Ingredients
    'l-cysteine', 'glycerides', 'stearic acid', 'oleic acid'
  ],
  
  // Special permissions (VOP-specific allowances)
  permitted: [
    'honey', // Permitted as per VOP tradition
    'bee pollen', // Natural health supplement
    'propolis', // Natural health product
    'royal jelly' // Natural health product
  ],
  
  // Required certifications for trust
  preferredCertifications: [
    'vegan certified',
    'plant-based certified',
    'vop approved',
    'badatz vegan',
    'vegan society',
    'certified vegan',
    'eve vegan',
    'vegan action'
  ],
  
  // Health-focused requirements
  healthGuidelines: {
    preferOrganic: true,
    avoidProcessed: true,
    preferWholeFood: true,
    limitSugar: true,
    limitSalt: true,
    noArtificialColors: true,
    noPreservatives: true,
    noMSG: true
  }
};

export interface VOPComplianceResult {
  isCompliant: boolean;
  confidence: number; // 0-100
  score: number; // 0-100 overall health score
  issues: string[];
  warnings: string[];
  suggestions: string[];
  certifications: string[];
  healthScore: {
    organic: boolean;
    wholeFood: boolean;
    minimalProcessing: boolean;
    noArtificialIngredients: boolean;
  };
  // For clothing/apparel
  clothingCompliance?: {
    naturalFabrics: boolean;
    modestDesign: boolean;
    ethicalProduction: boolean;
    sustainableMaterials: boolean;
  };
}

export class VOPComplianceService {
  /**
   * Check if a product meets VOP standards (dietary or clothing)
   */
  static checkCompliance(productData: {
    name: string;
    description?: string;
    ingredients?: string[];
    materials?: string[];
    certifications?: string[];
    tags?: string[];
    category?: string;
    allergens?: string[];
  }): VOPComplianceResult {
    // Check if this is a clothing/apparel product
    const clothingCategories = ['clothing', 'apparel', 'fashion', 'accessories', 'wear', 'outfit', 'garment'];
    const isClothing = productData.category && clothingCategories.some(cat => 
      productData.category!.toLowerCase().includes(cat)
    ) || (productData.tags && productData.tags.some(tag => 
      clothingCategories.some(cat => tag.toLowerCase().includes(cat))
    ));
    
    if (isClothing) {
      return this.checkClothingCompliance(productData);
    }
    const result: VOPComplianceResult = {
      isCompliant: true,
      confidence: 100,
      score: 100,
      issues: [],
      warnings: [],
      suggestions: [],
      certifications: [],
      healthScore: {
        organic: false,
        wholeFood: false,
        minimalProcessing: false,
        noArtificialIngredients: true
      }
    };
    
    // Combine all text for analysis
    const fullText = [
      productData.name,
      productData.description,
      ...(productData.ingredients || []),
      ...(productData.tags || []),
      ...(productData.allergens || [])
    ].join(' ').toLowerCase();
    
    // Check for prohibited ingredients
    for (const prohibited of VOP_GUIDELINES.prohibited) {
      if (fullText.includes(prohibited)) {
        // Check if it's a false positive (e.g., "butternut squash", "cream of tartar")
        const falsePositives = [
          { term: 'butter', safe: ['butternut', 'butter bean', 'shea butter', 'cocoa butter', 'nut butter'] },
          { term: 'cream', safe: ['cream of tartar', 'coconut cream', 'cream style', 'creamy'] },
          { term: 'milk', safe: ['coconut milk', 'almond milk', 'soy milk', 'oat milk', 'rice milk', 'milky'] },
          { term: 'cheese', safe: ['cheesy flavor', 'nutritional yeast'] }
        ];
        
        let isFalsePositive = false;
        for (const fp of falsePositives) {
          if (prohibited === fp.term && fp.safe.some(safe => fullText.includes(safe))) {
            isFalsePositive = true;
            break;
          }
        }
        
        if (!isFalsePositive) {
          result.isCompliant = false;
          result.confidence = 0;
          result.issues.push(`Contains prohibited ingredient: ${prohibited}`);
        }
      }
    }
    
    // Check for special permitted ingredients
    for (const permitted of VOP_GUIDELINES.permitted) {
      if (fullText.includes(permitted)) {
        result.suggestions.push(`Contains ${permitted} - permitted under VOP guidelines`);
      }
    }
    
    // Check certifications
    if (productData.certifications) {
      for (const cert of productData.certifications) {
        const certLower = cert.toLowerCase();
        if (VOP_GUIDELINES.preferredCertifications.some(pc => certLower.includes(pc))) {
          result.certifications.push(cert);
          result.confidence = Math.min(100, result.confidence + 10);
        }
      }
    }
    
    // If no vegan certification found
    if (result.certifications.length === 0 && result.isCompliant) {
      result.warnings.push('No recognized vegan certification found');
      result.suggestions.push('Consider obtaining vegan certification for customer trust');
      result.confidence = Math.max(0, result.confidence - 20);
    }
    
    // Health score evaluation
    if (fullText.includes('organic')) {
      result.healthScore.organic = true;
      result.score += 10;
    }
    
    if (fullText.includes('whole') || fullText.includes('raw')) {
      result.healthScore.wholeFood = true;
      result.score += 10;
    }
    
    if (fullText.includes('processed') || fullText.includes('refined')) {
      result.healthScore.minimalProcessing = false;
      result.warnings.push('Contains processed ingredients');
      result.score -= 10;
    }
    
    if (fullText.includes('artificial') || fullText.includes('synthetic')) {
      result.healthScore.noArtificialIngredients = false;
      result.warnings.push('Contains artificial ingredients');
      result.score -= 15;
    }
    
    // Check for health warnings
    if (fullText.includes('sugar') || fullText.includes('syrup')) {
      result.warnings.push('Contains added sugars');
      result.suggestions.push('Consider using natural sweeteners like dates');
    }
    
    if (fullText.includes('salt') || fullText.includes('sodium')) {
      result.warnings.push('Contains added salt');
      result.suggestions.push('Consider reducing sodium content');
    }
    
    // Ensure scores are within bounds
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    result.score = Math.max(0, Math.min(100, result.score));
    
    // Add general suggestions if compliant
    if (result.isCompliant && result.issues.length === 0) {
      result.suggestions.push('Product meets VOP dietary standards');
      if (result.healthScore.organic && result.healthScore.wholeFood) {
        result.suggestions.push('Excellent health profile - organic and whole food based');
      }
    }
    
    return result;
  }
  
  /**
   * Check if a clothing/apparel item meets VOP standards
   */
  static checkClothingCompliance(productData: {
    name: string;
    description?: string;
    materials?: string[];
    tags?: string[];
    category?: string;
    certifications?: string[];
  }): VOPComplianceResult {
    const result: VOPComplianceResult = {
      isCompliant: true,
      confidence: 100,
      score: 100,
      issues: [],
      warnings: [],
      suggestions: [],
      certifications: [],
      healthScore: {
        organic: false,
        wholeFood: false,
        minimalProcessing: true,
        noArtificialIngredients: true
      },
      clothingCompliance: {
        naturalFabrics: false,
        modestDesign: true,
        ethicalProduction: false,
        sustainableMaterials: false
      }
    };
    
    // Combine all text for analysis
    const fullText = [
      productData.name,
      productData.description,
      ...(productData.materials || []),
      ...(productData.tags || [])
    ].join(' ').toLowerCase();
    
    // Check for natural fabrics
    let naturalFabricCount = 0;
    let syntheticCount = 0;
    
    for (const fabric of VOP_CLOTHING_GUIDELINES.naturalFabrics) {
      if (fullText.includes(fabric)) {
        naturalFabricCount++;
        result.clothingCompliance!.naturalFabrics = true;
      }
    }
    
    for (const synthetic of VOP_CLOTHING_GUIDELINES.syntheticMaterials) {
      if (fullText.includes(synthetic)) {
        syntheticCount++;
        result.warnings.push(`Contains synthetic material: ${synthetic}`);
        result.score -= 10;
      }
    }
    
    // Fabric composition evaluation
    if (naturalFabricCount > 0 && syntheticCount === 0) {
      result.suggestions.push('Excellent choice of natural fabrics');
      result.score += 10;
    } else if (syntheticCount > naturalFabricCount) {
      result.issues.push('High synthetic content - consider more natural alternatives');
      result.confidence -= 20;
    }
    
    // Check modest design
    let modestScore = 0;
    let nonModestScore = 0;
    
    for (const keyword of VOP_CLOTHING_GUIDELINES.modestKeywords) {
      if (fullText.includes(keyword)) {
        modestScore++;
      }
    }
    
    for (const keyword of VOP_CLOTHING_GUIDELINES.nonModestKeywords) {
      if (fullText.includes(keyword)) {
        nonModestScore++;
        result.clothingCompliance!.modestDesign = false;
      }
    }
    
    if (nonModestScore > 0) {
      result.warnings.push('Design may not align with modest fashion guidelines');
      result.suggestions.push('Consider designs with more coverage and relaxed fits');
      result.confidence -= 15;
    } else if (modestScore > 0) {
      result.suggestions.push('Design aligns well with modest fashion principles');
    }
    
    // Check ethical production
    for (const keyword of VOP_CLOTHING_GUIDELINES.ethicalKeywords) {
      if (fullText.includes(keyword)) {
        result.clothingCompliance!.ethicalProduction = true;
        result.clothingCompliance!.sustainableMaterials = true;
        result.score += 5;
        break;
      }
    }
    
    // Check certifications
    if (productData.certifications) {
      for (const cert of productData.certifications) {
        const certLower = cert.toLowerCase();
        if (VOP_CLOTHING_GUIDELINES.certifications.some(c => certLower.includes(c.toLowerCase()))) {
          result.certifications.push(cert);
          result.confidence = Math.min(100, result.confidence + 10);
          result.clothingCompliance!.ethicalProduction = true;
        }
      }
    }
    
    // Final recommendations
    if (result.clothingCompliance!.naturalFabrics && result.clothingCompliance!.modestDesign) {
      result.suggestions.push('Product meets VOP clothing standards for natural materials and modest design');
    }
    
    if (!result.clothingCompliance!.ethicalProduction) {
      result.suggestions.push('Consider obtaining ethical production certifications');
    }
    
    // Ensure scores are within bounds
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    result.score = Math.max(0, Math.min(100, result.score));
    
    return result;
  }
  
  /**
   * Get guidelines summary for both dietary and clothing
   */
  static getGuidelines() {
    return {
      dietary: {
        principles: [
          '100% Plant-Based (Vegan)',
          'No meat, poultry, fish, or seafood',
          'No dairy products or eggs',
          'No animal-derived ingredients',
          'Honey and bee products are permitted',
          'Prefer organic and whole foods',
          'Minimize processed ingredients',
          'No artificial colors or preservatives'
        ],
        certifications: VOP_GUIDELINES.preferredCertifications,
        healthFocus: [
          'Preventative health through nutrition',
          'Clean body, soul, and mind',
          'Natural and wholesome ingredients',
          'Traditional preparation methods',
          'Community wellness focus'
        ]
      },
      clothing: {
        principles: [
          'Natural fabrics preferred (cotton, linen, hemp)',
          'Minimal synthetic materials',
          'Modest fashion - appropriate coverage',
          'Comfortable and dignified designs',
          'Ethical and sustainable production',
          'Support local artisans when possible'
        ],
        preferredMaterials: VOP_CLOTHING_GUIDELINES.naturalFabrics.slice(0, 6),
        certifications: VOP_CLOTHING_GUIDELINES.certifications,
        values: [
          'Respect for body and community',
          'Environmental consciousness',
          'Fair labor practices',
          'Quality over quantity',
          'Timeless over trendy'
        ]
      }
    };
  }
  
  /**
   * Generate compliance badge/label
   */
  static getComplianceBadge(result: VOPComplianceResult): {
    status: 'approved' | 'warning' | 'rejected';
    label: string;
    color: string;
    icon: string;
  } {
    if (!result.isCompliant) {
      return {
        status: 'rejected',
        label: 'Not VOP Compliant',
        color: '#c23c09', // earth-flame
        icon: 'fa-times-circle'
      };
    }
    
    if (result.confidence >= 80 && result.score >= 80) {
      return {
        status: 'approved',
        label: 'VOP Approved',
        color: '#478c0b', // leaf-green
        icon: 'fa-check-circle'
      };
    }
    
    return {
      status: 'warning',
      label: 'Needs Review',
      color: '#f6af0d', // sun-gold
      icon: 'fa-exclamation-triangle'
    };
  }
}