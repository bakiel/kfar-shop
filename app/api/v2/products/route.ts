import { NextRequest, NextResponse } from 'next/server';
import { productDb } from '@/lib/db/supabase-database';
import realtimeService, { RealtimeEvent } from '@/lib/services/realtime-service';

// GET /api/v2/products - Get all products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      vendorId: searchParams.get('vendorId') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : 
               searchParams.get('inStock') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const products = await productDb.getAll(filters);
    
    // Apply pagination
    const paginatedProducts = products.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/v2/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.vendorId || !body.name || !body.category || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate product ID if not provided
    const productId = body.id || `${body.vendorId}-${Date.now()}`;

    // Create product in database
    const product = await productDb.create({
      ...body,
      id: productId,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      status: body.status || 'draft',
      inStock: body.inStock !== false,
      stockQuantity: body.stockQuantity || 0,
      trackInventory: body.trackInventory !== false,
      lowStockThreshold: body.lowStockThreshold || 10
    });

    // Emit real-time event
    realtimeService.emit(RealtimeEvent.PRODUCT_CREATED, {
      vendorId: product.vendorId,
      productId: product.id,
      product
    });

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PATCH /api/v2/products/bulk - Bulk update products
export async function PATCH(request: NextRequest) {
  try {
    const { updates } = await request.json();
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid updates array' },
        { status: 400 }
      );
    }

    const results = await productDb.bulkUpdate(updates);

    // Emit real-time events for each update
    updates.forEach((update, index) => {
      if (results[index]) {
        realtimeService.emit(RealtimeEvent.PRODUCT_UPDATED, {
          vendorId: results[index].vendorId,
          productId: update.id,
          changes: update.updates,
          product: results[index]
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: results,
      updated: results.length
    });
  } catch (error) {
    console.error('Error bulk updating products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update products' },
      { status: 500 }
    );
  }
}