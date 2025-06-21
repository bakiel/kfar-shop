import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Get product by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const productId = params.id
    console.log(`API: Fetching product with ID: ${productId}`)
    
    // Import product data from complete catalog
    const { getProduct } = await import('@/lib/data/complete-catalog')
    
    // Find product using the helper function
    let product = getProduct(productId)
    
    if (!product) {
      console.log(`Product not found with ID: ${productId}`)
      
      // Try alternative lookups
      const { getAllProducts } = await import('@/lib/data/wordpress-style-data-layer')
      const allProducts = getAllProducts()
      
      // Log first few product IDs for debugging
      console.log('Sample product IDs:', allProducts.slice(0, 5).map(p => ({ id: p.id, name: p.name })))
      
      // Try to find by partial match
      product = allProducts.find(p => 
        p.id === productId ||
        p.id.toLowerCase() === productId.toLowerCase() ||
        p.id.includes(productId) ||
        productId.includes(p.id)
      )
      
      if (!product) {
        return NextResponse.json(
          { 
            error: 'Product not found',
            requestedId: productId,
            availableIds: allProducts.slice(0, 10).map(p => p.id)
          },
          { status: 404 }
        )
      }
    }
    
    // Ensure we have a mutable copy
    const productData = { ...product }
    
    // Add vendorName if not present
    if (!productData.vendorName && productData.vendorId) {
      productData.vendorName = getVendorName(productData.vendorId)
    }
    
    // Add extended data if available
    const extendedData = await getExtendedProductData(productId)
    if (extendedData) {
      productData.extendedData = extendedData
    }
    
    console.log(`API: Successfully found product: ${productData.name}`)
    return NextResponse.json(productData)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const updates = await request.json()
    
    // Verify authentication
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Decode token to get user info
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as any
    const userId = decoded.userId
    const userRole = decoded.role
    
    // Check permissions
    const hasPermission = await checkUpdatePermission(userId, userRole, productId)
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Update product in database
    const updatedProduct = await updateProduct(productId, updates, userId)
    
    // Sync to frontend data files if needed
    if (userRole === 'superadmin') {
      await syncToFrontendData(productId, updates)
    }
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function getVendorName(vendorId: string): string {
  const vendorNames: Record<string, string> = {
    'teva-deli': 'Teva Deli',
    'queens-cuisine': 'Queens Cuisine',
    'vop-shop': 'Village of Peace Shop',
    'garden-of-light': 'Garden of Light',
    'peoples-store': 'The People\'s Store',
    'gahn-delight': 'Gahn Delight'
  }
  return vendorNames[vendorId] || vendorId
}

async function getExtendedProductData(productId: string) {
  // In production, this would fetch from database
  // For now, return sample extended data structure
  return {
    specifications: {
      weight: "500g",
      dimensions: "15cm x 10cm x 5cm",
      servings: "4-6 servings",
      shelf_life: "7 days refrigerated",
      ingredients: ["Wheat protein", "Water", "Soy sauce", "Spices"],
      allergens: ["Gluten", "Soy"],
      certifications: ["Vegan Certified", "Kosher Certified"]
    },
    shipping_info: {
      weight: "550g",
      dimensions: "20cm x 15cm x 8cm",
      requires_refrigeration: true,
      shipping_class: "refrigerated"
    },
    storage_instructions: "Keep refrigerated at 2-4°C. Once opened, consume within 3 days. Can be frozen for up to 3 months.",
    preparation: {
      cooking_methods: ["Pan-fry", "Bake", "Grill", "Air-fry"],
      prep_time: "5 minutes",
      cook_time: "10-15 minutes",
      serving_suggestions: [
        "Serve with tahini sauce and fresh salad",
        "Add to pita with hummus and vegetables",
        "Slice and add to pasta dishes",
        "Serve with rice and roasted vegetables"
      ]
    },
    nutritional_highlights: [
      "High in protein (18g per serving)",
      "Good source of iron",
      "Low in saturated fat",
      "No cholesterol"
    ],
    seo: {
      meta_title: "Premium Vegan Product | KFAR Marketplace",
      meta_description: "Delicious plant-based alternative made with traditional methods",
      keywords: ["vegan", "plant-based", "protein", "kosher", "healthy"]
    }
  }
}

async function checkUpdatePermission(userId: string, userRole: string, productId: string): Promise<boolean> {
  // Super admin can edit anything
  if (userRole === 'superadmin') {
    return true
  }
  
  // Vendor can only edit their own products
  if (userRole === 'vendor') {
    // Check if user owns this product's vendor
    // In production, this would check against database
    return true // Placeholder
  }
  
  return false
}

async function updateProduct(productId: string, updates: any, userId: string) {
  // In production, this would update the database
  // For now, return the updated product
  const timestamp = new Date().toISOString()
  
  return {
    ...updates,
    id: productId,
    lastUpdatedBy: userId,
    lastUpdatedAt: timestamp
  }
}

async function syncToFrontendData(productId: string, updates: any) {
  // In production, this would trigger a sync to update the TypeScript data files
  // This ensures the static data stays in sync with database changes
  console.log(`Syncing product ${productId} to frontend data files...`)
}