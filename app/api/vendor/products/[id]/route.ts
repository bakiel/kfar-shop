import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import { invalidateProductFeedCache } from '@/lib/services/live-product-feed';
import { invalidateVendorFeedCache } from '@/lib/services/live-vendor-feed';
import {
  getVendorDisplayName,
  notifyActiveCustomers,
  notifyVendorOwners,
} from '@/lib/services/account-notification-events.server';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value) return [value];
  return [];
}

function normalizeVendorProduct(row: any) {
  const images = asArray(row.image_gallery || row.images);
  const image = row.image_url || row.primary_image || row.image_path || row.image || images[0] || '/images/placeholder-product.jpg';
  return {
    ...row,
    image,
    images: images.length > 0 ? images : (image ? [image] : []),
  };
}

function invalidateLiveFeedCaches() {
  invalidateProductFeedCache();
  invalidateVendorFeedCache();
}

// Helper to verify product ownership
async function verifyProductOwnership(productId: string, vendorId: string) {
  const { rows } = await query(
    'SELECT id, vendor_id, name, status FROM products WHERE id = $1',
    [productId]
  );
  if (rows.length === 0) return { exists: false, owned: false, product: null };
  return { exists: true, owned: rows[0].vendor_id === vendorId, product: rows[0] };
}

function isLiveProductStatus(status?: string | null) {
  return status === 'published' || status === 'active';
}

async function sendProductUpdatedNotifications(vendorId: string, previousProduct: any, product: any) {
  try {
    const wasLive = isLiveProductStatus(previousProduct?.status);
    const isLive = isLiveProductStatus(product.status);
    const statusChanged = previousProduct?.status && previousProduct.status !== product.status;

    await notifyVendorOwners(vendorId, {
      type: 'product',
      channel: 'in_app',
      title: statusChanged ? 'Product status updated' : 'Product updated',
      titleHe: statusChanged ? 'סטטוס המוצר עודכן' : 'המוצר עודכן',
      message: statusChanged
        ? `${product.name} is now ${product.status}.`
        : `${product.name} was updated successfully.`,
      messageHe: statusChanged
        ? `${product.name} כעת בסטטוס ${product.status}.`
        : `${product.name} עודכן בהצלחה.`,
      data: {
        productId: product.id,
        vendorId,
        previousStatus: previousProduct?.status,
        status: product.status,
        actionUrl: '/vendor/admin/products',
        actionLabel: 'Manage products',
      },
    });

    if (!wasLive && isLive) {
      const vendorName = await getVendorDisplayName(vendorId);
      notifyActiveCustomers({
        type: 'product',
        channel: 'in_app',
        title: `New product from ${vendorName}`,
        titleHe: `מוצר חדש מאת ${vendorName}`,
        message: `${product.name} is now available in KFAR Marketplace.`,
        messageHe: `${product.name} זמין כעת בשוק כפר.`,
        data: {
          productId: product.id,
          vendorId,
          actionUrl: `/product/${product.id}`,
          actionLabel: 'View product',
        },
      }).catch(error => console.error('Customer product notification fanout failed:', error));
    }
  } catch (error) {
    console.error('Product update notification dispatch failed:', error);
  }
}

async function sendProductArchivedNotification(vendorId: string, product: any) {
  try {
    await notifyVendorOwners(vendorId, {
      type: 'product',
      channel: 'in_app',
      title: 'Product archived',
      titleHe: 'המוצר הועבר לארכיון',
      message: `${product.name} was removed from the live marketplace.`,
      messageHe: `${product.name} הוסר מהשוק הפעיל.`,
      data: {
        productId: product.id,
        vendorId,
        actionUrl: '/vendor/admin/products',
        actionLabel: 'Manage products',
      },
    });
  } catch (error) {
    console.error('Product archive notification dispatch failed:', error);
  }
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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor access required' },
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
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: normalizeVendorProduct(rows[0]),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    // Verify ownership
    const ownership = await verifyProductOwnership(productId, user.vendorId);
    if (!ownership.exists) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    if (!ownership.owned) {
      return NextResponse.json(
        { success: false, error: 'Product does not belong to this vendor' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build dynamic update against the live DB schema. UI aliases map here.
    const fieldMap: Record<string, string> = {
      name: 'name',
      name_he: 'name_he',
      description: 'description',
      description_he: 'description_he',
      price: 'price',
      original_price: 'original_price',
      category: 'category',
      image: 'image_url',
      image_url: 'image_url',
      images: 'image_gallery',
      image_gallery: 'image_gallery',
      tags: 'tags',
      status: 'status',
      stock_quantity: 'stock_quantity',
      unit: 'unit',
      is_vegan: 'is_vegan',
      is_kosher: 'is_kosher',
      is_organic: 'is_organic',
      is_gluten_free: 'is_gluten_free',
      nutritional_info: 'nutritional_info',
      ingredients: 'ingredients',
      allergens: 'allergens',
    };

    const updateFields: string[] = [];
    const values: any[] = [productId]; // $1 is always the product ID
    const seenColumns = new Set<string>();
    let paramIndex = 2;

    for (const field of Object.keys(fieldMap)) {
      if (body[field] !== undefined) {
        const column = fieldMap[field];
        if (seenColumns.has(column)) continue;
        let value = body[field];
        if (column === 'image_gallery' || column === 'tags' || column === 'ingredients' || column === 'allergens') {
          value = asArray(value);
        }
        updateFields.push(`${column} = $${paramIndex}`);
        values.push(value);
        seenColumns.add(column);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');

    const { rows } = await query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    invalidateLiveFeedCaches();
    await sendProductUpdatedNotifications(user.vendorId, ownership.product, rows[0]);

    return NextResponse.json({
      success: true,
      product: normalizeVendorProduct(rows[0]),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    // Verify ownership
    const ownership = await verifyProductOwnership(productId, user.vendorId);
    if (!ownership.exists) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    if (!ownership.owned) {
      return NextResponse.json(
        { success: false, error: 'Product does not belong to this vendor' },
        { status: 403 }
      );
    }

    // Soft delete - set status to archived
    const { rows } = await query(
      "UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING id, name, status",
      [productId]
    );

    invalidateLiveFeedCaches();
    await sendProductArchivedNotification(user.vendorId, rows[0]);

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully',
      product: rows[0],
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
