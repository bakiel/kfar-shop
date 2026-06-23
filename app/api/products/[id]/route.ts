import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/services/auth-service'
import { query } from '@/lib/db/postgres-client'
import { getProductById, invalidateProductFeedCache } from '@/lib/services/live-product-feed'
import { invalidateVendorFeedCache } from '@/lib/services/live-vendor-feed'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

function invalidateLiveFeedCaches() {
  invalidateProductFeedCache()
  invalidateVendorFeedCache()
}

// Get product by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = params.id

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json(
        {
          error: 'Product not found',
          requestedId: productId,
        },
        { status: 404, headers: NO_STORE_HEADERS }
      )
    }

    const productData: any = { ...product }
    
    // Add extended data if available
    const extendedData = await getExtendedProductData(productId)
    if (extendedData) {
      productData.extendedData = extendedData
    }
    
    return NextResponse.json(productData, { headers: NO_STORE_HEADERS })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}

// Update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = params.id
    const updates = await request.json()
    
    // Verify authentication from the modern Authorization header, with the
    // legacy cookie retained for older admin/vendor screens.
    const cookieStore = await cookies()
    const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const token = bearerToken || cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token using auth-service (no insecure fallback secret)
    const user = verifyAccessToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const userId = user.id
    const userRole = user.role

    // Check permissions
    const hasPermission = await checkUpdatePermission(userId, userRole, productId, user.vendorId)
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Update product in database
    const updatedProduct = await updateProduct(productId, updates)
    invalidateLiveFeedCaches()
    
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

async function checkUpdatePermission(
  userId: string,
  userRole: string,
  productId: string,
  vendorId?: string
): Promise<boolean> {
  // Super admin can edit anything
  if (userRole === 'admin') {
    return true
  }

  // Vendor can only edit their own products - verify ownership via DB
  if (userRole === 'vendor' && vendorId) {
    const { rows } = await query(
      'SELECT id FROM products WHERE id = $1 AND vendor_id = $2',
      [productId, vendorId]
    )
    return rows.length > 0
  }

  return false
}

async function updateProduct(productId: string, updates: any) {
  const { rows: columnRows } = await query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'products'`
  )
  const availableColumns = new Set(columnRows.map(row => row.column_name))

  const fieldMap: Record<string, string> = {
    name: 'name',
    name_he: 'name_he',
    nameHe: 'name_he',
    description: 'description',
    description_he: 'description_he',
    descriptionHe: 'description_he',
    price: 'price',
    original_price: 'original_price',
    originalPrice: 'original_price',
    category: 'category',
    image: 'image_url',
    image_url: 'image_url',
    images: 'image_gallery',
    image_gallery: 'image_gallery',
    tags: 'tags',
    status: 'status',
    stock_quantity: 'stock_quantity',
    stockQuantity: 'stock_quantity',
    in_stock: 'in_stock',
    inStock: 'in_stock',
    unit: 'unit',
    is_vegan: 'is_vegan',
    vegan: 'is_vegan',
    is_kosher: 'is_kosher',
    kosher: 'is_kosher',
    is_organic: 'is_organic',
    organic: 'is_organic',
    is_gluten_free: 'is_gluten_free',
    glutenFree: 'is_gluten_free',
    nutritional_info: 'nutritional_info',
    nutritionalInfo: 'nutritional_info',
    ingredients: 'ingredients',
    allergens: 'allergens',
    specifications: 'specifications',
  }

  const arrayColumns = new Set(['image_gallery', 'tags', 'ingredients', 'allergens'])
  const jsonColumns = new Set(['nutritional_info', 'specifications'])
  const updateFields: string[] = []
  const values: any[] = [productId]
  const seenColumns = new Set<string>()
  let hasWritableField = false

  for (const [field, column] of Object.entries(fieldMap)) {
    if (updates[field] === undefined || seenColumns.has(column) || !availableColumns.has(column)) continue

    let value = updates[field]
    if (arrayColumns.has(column)) {
      value = Array.isArray(value)
        ? value.map(String).filter(Boolean)
        : String(value || '').split(',').map(item => item.trim()).filter(Boolean)
    }
    if (jsonColumns.has(column) && value === '') {
      value = null
    }

    values.push(value)
    updateFields.push(`${column} = $${values.length}`)
    seenColumns.add(column)
    hasWritableField = true
  }

  if (!hasWritableField) {
    throw new Error('No valid product fields to update')
  }

  if (availableColumns.has('updated_at')) {
    updateFields.push('updated_at = NOW()')
  }

  const { rows } = await query(
    `UPDATE products
     SET ${updateFields.join(', ')}
     WHERE id = $1
     RETURNING *`,
    values
  )

  if (!rows[0]) {
    throw new Error('Product not found')
  }

  return rows[0]
}
