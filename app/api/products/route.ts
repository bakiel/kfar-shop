import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/data/wordpress-style-data-layer';
import { findBestMatch, applyVoiceCorrections, partialMatch } from '@/lib/utils/string-matching';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawSearch = searchParams.get('search') || '';
  const search = applyVoiceCorrections(rawSearch).toLowerCase();
  
  // Get real products from your data system
  const allProducts = getAllProducts();
  
  // Transform to match the expected format for voice chat
  const products = allProducts.map(product => ({
    id: product.id,
    name: product.nameEn || product.name,
    price: product.price,
    vendor: product.vendor?.name || 'KFAR Vendor',
    vendorId: product.vendorId,
    category: product.category,
    image: product.images?.[0] || product.image || '',
    description: product.descriptionEn || product.description || ''
  }));
  
  let filteredProducts = products;
  
  // Filter by search term with fuzzy matching
  if (search) {
    // First try exact matches
    filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.vendor.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
    );
    
    // If no exact matches, try fuzzy matching
    if (filteredProducts.length === 0) {
      const productNames = products.map(p => p.name);
      const fuzzyMatch = findBestMatch(search, productNames, 0.5);
      
      if (fuzzyMatch.match) {
        filteredProducts = products.filter(p => p.name === fuzzyMatch.match);
        console.log(`Fuzzy matched "${search}" to "${fuzzyMatch.match}" with confidence ${fuzzyMatch.confidence}`);
      } else {
        // Try partial matching as last resort
        filteredProducts = products.filter(product => 
          partialMatch(search, product.name) ||
          partialMatch(search, product.description)
        );
      }
    }
    
    // Special searches
    if (search.includes('special') || search.includes('sale') || search.includes('deal')) {
      // Return featured products or those with special tags
      const featured = products.filter(p => 
        p.name.toLowerCase().includes('special') || 
        p.description.toLowerCase().includes('deal') ||
        p.price < 30 // Show lower priced items as deals
      );
      filteredProducts = featured.length > 0 ? featured.slice(0, 5) : products.slice(0, 5);
    }
    
    if (search.includes('best') || search.includes('popular')) {
      // Return most popular items (can be based on actual data later)
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes('hummus') || 
        p.name.toLowerCase().includes('schnitzel') ||
        p.name.toLowerCase().includes('falafel')
      ).slice(0, 5);
    }
    
    if (search.includes('vegan')) {
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes('vegan') ||
        p.name.toLowerCase().includes('tofu') ||
        p.name.toLowerCase().includes('seitan') ||
        p.vendor.toLowerCase().includes('teva deli')
      );
    }
    
    if (search.includes('under')) {
      const priceMatch = search.match(/under (\d+)/);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[1]);
        filteredProducts = products.filter(p => p.price <= maxPrice);
      }
    }
    
    // Category searches
    if (search.includes('dessert') || search.includes('sweet') || search.includes('ice cream')) {
      filteredProducts = products.filter(p => 
        p.category.toLowerCase().includes('dessert') ||
        p.name.toLowerCase().includes('ice cream') ||
        p.name.toLowerCase().includes('parfait') ||
        p.vendor.toLowerCase().includes('gahn delight')
      );
    }
    
    if (search.includes('breakfast')) {
      filteredProducts = products.filter(p => 
        p.category.toLowerCase().includes('breakfast') ||
        p.name.toLowerCase().includes('bread') ||
        p.name.toLowerCase().includes('hummus') ||
        p.name.toLowerCase().includes('tahini')
      );
    }
    
    // Vendor-specific searches
    if (search.includes('teva deli') || search.includes('teva-deli')) {
      filteredProducts = products.filter(p => 
        p.vendor.toLowerCase().includes('teva deli') ||
        p.vendorId === 'teva-deli'
      );
    }
    
    if (search.includes('people') || search.includes('people\'s store') || search.includes('peoples store')) {
      filteredProducts = products.filter(p => 
        p.vendor.toLowerCase().includes('people') ||
        p.vendorId === 'peoples-store'
      );
    }
    
    if (search.includes('gahn delight')) {
      filteredProducts = products.filter(p => 
        p.vendor.toLowerCase().includes('gahn') ||
        p.vendorId === 'gahn-delight'
      );
    }
    
    // Limit results for voice interface
    filteredProducts = filteredProducts.slice(0, 10);
  }
  
  return NextResponse.json({ 
    products: filteredProducts,
    total: filteredProducts.length 
  });
}