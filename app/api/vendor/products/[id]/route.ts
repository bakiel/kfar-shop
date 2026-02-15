import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// Helper to verify product ownership
async function verifyProductOwnership(productId: string, vendorId: string) {
  const { rows } = await query(
    'SELECT id, vendor_id FROM products WHERE id = $1',
    [productId]
  );
  if (rows.length === 0) return { exists: false, owned: false };
  return { exists: true, owned: rows[0].vendor_id === vendorId };
}

// GET - Retrieve a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    const { rows } = await query(
      'SELECT * FROM products WHERE id = $1 AND vendor_id = $2',
      [productId, user.vendorId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: rows[0],
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    // Verify ownership
    const ownership = await verifyProductOwnership(productId, user.vendorId);
    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    if (!ownership.owned) {
      return NextResponse.json(
        { error: 'Product does not belong to this vendor' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build dynamic update - only update fields that are provided
    const allowedFields = [
      'name', 'name_he', 'description', 'description_he',
      'price', 'category', 'image', 'images', 'tags',
      'status', 'stock_quantity', 'unit',
    ];

    const updateFields: string[] = [];
    const values: any[] = [productId]; // $1 is always the product ID
    let paramIndex = 2;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        // Serialize arrays/objects to JSON
        if (field === 'images' || field === 'tags') {
          value = JSON.stringify(value);
        }
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');

    const { rows } = await query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    return NextResponse.json({
      success: true,
      product: rows[0],
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a product (set status to 'archived')
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    // Verify ownership
    const ownership = await verifyProductOwnership(productId, user.vendorId);
    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    if (!ownership.owned) {
      return NextResponse.json(
        { error: 'Product does not belong to this vendor' },
        { status: 403 }
      );
    }

    // Soft delete - set status to archived
    const { rows } = await query(
      "UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING id, name, status",
      [productId]
    );

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully',
      product: rows[0],
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
