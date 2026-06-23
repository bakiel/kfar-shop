#!/usr/bin/env node

/**
 * Initialize KFAR Knowledge Base with marketplace data
 * Run this script to populate the knowledge base with all product, vendor, and other information
 */

const fs = require('fs');
const path = require('path');

const baseUrl = process.env.KFAR_KNOWLEDGE_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com';

async function fetchJson(apiPath) {
  const response = await fetch(new URL(apiPath, baseUrl), {
    headers: { 'Cache-Control': 'no-cache' },
  });

  if (!response.ok) {
    throw new Error(`${apiPath} returned HTTP ${response.status}`);
  }

  return response.json();
}

function normalizeProduct(product) {
  return {
    ...product,
    vendor: product.vendorName,
    isVegan: product.vegan !== false,
    isKosher: Boolean(product.kashrut),
    isOrganic: product.organic === true,
    isGlutenFree: product.glutenFree === true,
  };
}

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

function buildPriceStats(products) {
  const prices = products
    .map(product => Number(product.price))
    .filter(Number.isFinite);

  return {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
    average: prices.length
      ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
      : 0,
  };
}

async function main() {
  const [productFeed, vendorFeed] = await Promise.all([
    fetchJson('/api/products-db'),
    fetchJson('/api/vendors'),
  ]);

  if (productFeed.source !== 'database' || productFeed.stale === true) {
    throw new Error(`Product feed is not a fresh database feed (source=${productFeed.source}, stale=${productFeed.stale})`);
  }

  if (vendorFeed.source !== 'database' || vendorFeed.stale === true) {
    throw new Error(`Vendor feed is not a fresh database feed (source=${vendorFeed.source}, stale=${vendorFeed.stale})`);
  }

  const products = (productFeed.products || []).map(normalizeProduct);
  const vendors = (vendorFeed.vendors || []).map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    productCount: vendor.productCount || 0,
    description: vendor.description || '',
    specialties: vendor.categories || [],
  }));

  const knowledgeBaseInit = {
    products,
    vendors,
    additionalKnowledge,
    stats: {
      totalProducts: products.length,
      totalVendors: vendors.length,
      priceRange: buildPriceStats(products),
      categories: [...new Set(products.map(product => product.category).filter(Boolean))],
    },
    source: {
      products: productFeed.source,
      vendors: vendorFeed.source,
      generatedAt: new Date().toISOString(),
    },
  };

  const outputPath = path.join(__dirname, '../lib/data/knowledge-base-init.json');
  fs.writeFileSync(outputPath, JSON.stringify(knowledgeBaseInit, null, 2));

  console.log('Knowledge Base initialization data created from the live database feed');
  console.log('Stats:');
  console.log(`   - Total Products: ${knowledgeBaseInit.stats.totalProducts}`);
  console.log(`   - Total Vendors: ${knowledgeBaseInit.stats.totalVendors}`);
  console.log(`   - Price Range: ₪${knowledgeBaseInit.stats.priceRange.min} - ₪${knowledgeBaseInit.stats.priceRange.max}`);
  console.log(`   - Average Price: ₪${knowledgeBaseInit.stats.priceRange.average}`);
  console.log(`   - Categories: ${knowledgeBaseInit.stats.categories.length}`);
  console.log(`Output: ${outputPath}`);
}

main().catch(error => {
  console.error('Failed to create Knowledge Base initialization data:', error);
  process.exit(1);
});
