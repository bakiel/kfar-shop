#!/usr/bin/env node

/**
 * Initialize KFAR Knowledge Base with marketplace data
 * Run this script to populate the knowledge base with all product, vendor, and other information
 */

const fs = require('fs');
const path = require('path');

// Import vendor catalogs
const tevaDeli = require('../lib/data/teva-deli-complete-catalog');
const gahnDelight = require('../lib/data/gahn-delight-complete-catalog.json');
const gardenOfLight = require('../lib/data/garden-of-light-complete-catalog.json');
const peopleStore = require('../lib/data/people-store-complete-catalog.json');
const queensCuisine = require('../lib/data/queens-cuisine-complete-catalog.json');
const vopShop = require('../lib/data/vop-shop-complete-catalog.json');

// Combine all product data
const allProducts = [
  ...tevaDeli.products.map(p => ({ ...p, vendorId: 'teva-deli', vendor: 'Teva Deli' })),
  ...gahnDelight.products.map(p => ({ ...p, vendorId: 'gahn-delight', vendor: 'Gahn Delight' })),
  ...gardenOfLight.products.map(p => ({ ...p, vendorId: 'garden-of-light', vendor: 'Garden of Light' })),
  ...peopleStore.products.map(p => ({ ...p, vendorId: 'people-store', vendor: 'People Store' })),
  ...queensCuisine.products.map(p => ({ ...p, vendorId: 'queens-cuisine', vendor: "Queen's Cuisine" })),
  ...vopShop.products.map(p => ({ ...p, vendorId: 'vop-shop', vendor: 'VOP Shop' })),
];

// Additional knowledge data
const additionalKnowledge = {
  recipes: [
    {
      id: 'healthy-breakfast',
      title: 'KFAR Power Breakfast',
      content: `Start your day with energy using KFAR products:
      
      INGREDIENTS:
      - Garden of Light fresh fruit salad (₪28)
      - People Store organic granola (₪32)
      - Gahn Delight coconut yogurt alternative (₪25)
      - People Store maple syrup (₪45)
      - VOP Shop herbal tea (₪18)
      
      PREPARATION:
      1. Layer yogurt alternative in a bowl
      2. Add fresh fruit salad
      3. Top with crunchy granola
      4. Drizzle with maple syrup
      5. Enjoy with hot herbal tea
      
      Total: ₪148 (serves 2)
      Nutritional benefits: High fiber, vitamins, minerals, plant protein`
    },
    {
      id: 'shabbat-feast',
      title: 'Complete Shabbat Dinner',
      content: `Traditional Shabbat meal, vegan style:
      
      MAIN COURSE:
      - Teva Deli seitan roast (₪65) - centerpiece
      - Queen's Cuisine stuffed peppers (₪48)
      - Garden of Light seasonal salad (₪35)
      - People Store challah bread (₪18)
      
      SIDES:
      - Teva Deli hummus trio (₪42)
      - People Store olives & pickles (₪28)
      - Garden of Light roasted vegetables (₪38)
      
      DESSERT:
      - Gahn Delight ice cream selection (₪75)
      
      Total: ₪349 (serves 6-8)
      Perfect for family gatherings!`
    }
  ],
  
  events: [
    {
      id: 'weekly-market',
      title: 'Village of Peace Weekly Market',
      content: `Every Thursday 8:00-14:00 at the Community Center.
      
      SPECIAL FEATURES:
      - Fresh produce from community gardens
      - Live cooking demonstrations
      - Meet the vendors personally
      - Special market-only discounts
      - Cultural performances
      - Children's activities
      
      FREE SAMPLES from all vendors!
      Bring your own bags for eco-friendly shopping.`
    },
    {
      id: 'cooking-workshop',
      title: 'Vegan Cooking Workshops',
      content: `Learn authentic Village of Peace recipes!
      
      UPCOMING WORKSHOPS:
      - Seitan Making Masterclass (Teva Deli)
      - Raw Food Preparation (Garden of Light)
      - Vegan Ice Cream Workshop (Gahn Delight)
      - Fermentation Basics (People Store)
      
      Cost: ₪120 per person (includes ingredients)
      Duration: 2-3 hours
      Language: Hebrew/English
      
      Contact: workshops@kfarmarketplace.com`
    }
  ],
  
  healthInfo: [
    {
      id: 'vegan-benefits',
      title: 'Health Benefits of Village of Peace Diet',
      content: `Scientific studies on our community show remarkable health outcomes:
      
      DISEASE PREVENTION:
      - 85% lower heart disease rates
      - 70% lower diabetes incidence
      - 60% lower cancer rates
      - Virtually no obesity
      
      LONGEVITY:
      - Average lifespan 10+ years longer
      - Active seniors in 80s and 90s
      - Mental clarity maintained
      
      KEY FACTORS:
      - 100% plant-based diet
      - No alcohol or tobacco
      - Regular exercise
      - Strong community bonds
      - Stress-free lifestyle
      - Organic, whole foods
      
      Join thousands who've transformed their health!`
    }
  ],
  
  sustainability: [
    {
      id: 'eco-practices',
      title: 'Sustainable Practices at KFAR',
      content: `Our commitment to Earth-friendly operations:
      
      PACKAGING:
      - 100% biodegradable materials
      - Reusable containers program
      - Zero plastic policy
      - Compostable shipping materials
      
      PRODUCTION:
      - Solar-powered facilities
      - Water recycling systems
      - Organic farming methods
      - Zero waste goal
      
      COMMUNITY:
      - Local sourcing priority
      - Bicycle delivery in Dimona
      - Tree planting program
      - Education initiatives
      
      Every purchase supports sustainable living!`
    }
  ]
};

// Generate knowledge base initialization file
const knowledgeBaseInit = {
  products: allProducts,
  vendors: [
    {
      id: 'teva-deli',
      name: 'Teva Deli',
      productCount: tevaDeli.products.length,
      description: 'Israeli vegan deli specializing in plant-based meat alternatives',
      specialties: ['seitan', 'tofu', 'meat alternatives', 'Israeli cuisine'],
    },
    {
      id: 'gahn-delight',
      name: 'Gahn Delight',
      productCount: gahnDelight.products.length,
      description: 'Artisanal vegan ice cream and frozen desserts',
      specialties: ['ice cream', 'desserts', 'sugar-free', 'frozen treats'],
    },
    {
      id: 'garden-of-light',
      name: 'Garden of Light',
      productCount: gardenOfLight.products.length,
      description: 'Fresh salads and healthy prepared foods',
      specialties: ['salads', 'raw food', 'juices', 'healthy meals'],
    },
    {
      id: 'people-store',
      name: 'People Store',
      productCount: peopleStore.products.length,
      description: 'Community market with organic groceries and household items',
      specialties: ['organic', 'bulk foods', 'fermented', 'eco-friendly'],
    },
    {
      id: 'queens-cuisine',
      name: "Queen's Cuisine",
      productCount: queensCuisine.products.length,
      description: 'Plant-based catering and prepared meals',
      specialties: ['burgers', 'prepared meals', 'catering', 'Middle Eastern'],
    },
    {
      id: 'vop-shop',
      name: 'VOP Shop',
      productCount: vopShop.products.length,
      description: 'Village of Peace merchandise and cultural items',
      specialties: ['merchandise', 'books', 'music', 'crafts', 'cultural items'],
    },
  ],
  additionalKnowledge,
  stats: {
    totalProducts: allProducts.length,
    totalVendors: 6,
    priceRange: {
      min: Math.min(...allProducts.map(p => p.price)),
      max: Math.max(...allProducts.map(p => p.price)),
      average: Math.round(allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length),
    },
    categories: [...new Set(allProducts.map(p => p.category).filter(Boolean))],
  }
};

// Write initialization data
const outputPath = path.join(__dirname, '../lib/data/knowledge-base-init.json');
fs.writeFileSync(outputPath, JSON.stringify(knowledgeBaseInit, null, 2));

console.log('✅ Knowledge Base initialization data created!');
console.log(`📊 Stats:`);
console.log(`   - Total Products: ${knowledgeBaseInit.stats.totalProducts}`);
console.log(`   - Total Vendors: ${knowledgeBaseInit.stats.totalVendors}`);
console.log(`   - Price Range: ₪${knowledgeBaseInit.stats.priceRange.min} - ₪${knowledgeBaseInit.stats.priceRange.max}`);
console.log(`   - Average Price: ₪${knowledgeBaseInit.stats.priceRange.average}`);
console.log(`   - Categories: ${knowledgeBaseInit.stats.categories.length}`);
console.log(`\n📁 Output: ${outputPath}`);
console.log(`\n🚀 Next step: Run 'npm run init-knowledge-base' to populate the database`);