import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import {
  getBundleRecordOriginalPrice,
  getBundleRecordPrice,
  getBundleRecordStatus,
  getBundleSavingsPercent,
  getBundleTableSchema,
  normalizeBundleRecord,
  sortBundleRecords,
} from '@/lib/db/bundles';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getProductFeed, ProductFeedProduct } from '@/lib/services/live-product-feed';

// Enrich bundle with resolved product details
function enrichBundle(bundle: any, productMap: Map<string, ProductFeedProduct>) {
  const normalized = normalizeBundleRecord(bundle);
  const resolvedProducts = normalized.products.map((pid: string) => {
    const product = productMap.get(pid);
    if (product) {
      return {
        id: product.id,
        name: product.name,
        nameHe: (product as any).nameHe,
        price: product.price,
        image: product.image,
        vendorName: product.vendorName,
      };
    }
    return { id: pid, name: pid, price: 0 };
  });

  return {
    ...bundle,
    nameHe: normalized.nameHe,
    description: normalized.description,
    products: normalized.products,
    price: normalized.price,
    originalPrice: normalized.originalPrice,
    status: normalized.status,
    image: normalized.image,
    isPromoted: normalized.isPromoted,
    is_promoted: normalized.isPromoted,
    resolvedProducts,
    discount: normalized.savingsPercent,
  };
}

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;
  if (!user || user.role !== 'admin') return null;
  return user;
}

// GET -- list all bundles
export async function GET(request: NextRequest) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bundleId = searchParams.get('id');

    // Try DB first
    let bundles: any[] = [];
    const dbUp = await isDbAvailable();

    if (dbUp) {
      try {
        const result = await query('SELECT * FROM bundles');
        bundles = sortBundleRecords(result.rows);

        if (bundleId) {
          bundles = bundles.filter((bundle) => bundle.id === bundleId);
        } else if (status && status !== 'all') {
          bundles = bundles.filter((bundle) => getBundleRecordStatus(bundle) === status);
        }
      } catch {
        // Table may not exist -- return empty result
      }
    }

    const productFeed = await getProductFeed();
    const productMap = new Map(productFeed.products.map((product) => [product.id, product]));
    const enriched = bundles.map((bundle) => enrichBundle(bundle, productMap));

    // Single bundle lookup
    if (bundleId) {
      if (enriched.length === 0) {
        return NextResponse.json(
          { error: `Bundle ${bundleId} not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ bundle: enriched[0] });
    }

    return NextResponse.json({
      bundles: enriched,
      total: enriched.length,
    });
  } catch (error) {
    console.error('Bundles GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    );
  }
}

// POST -- create a new bundle
export async function POST(request: NextRequest) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, nameHe, description, products, price, originalPrice, image, status, isPromoted } = body;

    if (!name || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'name and products (non-empty array) are required' },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'price must be a positive number' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const bundleId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `bundle-${Date.now()}`;
    const newBundle: any = {
      id: bundleId,
      name,
      nameHe: nameHe || '',
      description: description || '',
      products,
      price,
      originalPrice: originalPrice || price,
      status: status || 'draft',
      image: image || '/images/vendors/teva_deli_logo_vegan_factory.jpg',
      createdAt: now,
      updatedAt: now,
    };

    // Try DB insert
    const schema = await getBundleTableSchema();
    if (schema) {
      try {
        if (schema.hasIsPromoted && isPromoted === true) {
          await query('UPDATE bundles SET is_promoted = false WHERE is_promoted = true');
        }

        const columns = ['id', 'name'];
        const values: any[] = [newBundle.id, newBundle.name];

        if (schema.hasNameHe) {
          columns.push('name_he');
          values.push(newBundle.nameHe);
        }
        if (schema.hasDescription) {
          columns.push('description');
          values.push(newBundle.description);
        }
        if (schema.hasDescriptionHe) {
          columns.push('description_he');
          values.push('');
        }
        if (schema.hasProducts) {
          columns.push('products');
          values.push(JSON.stringify(newBundle.products));
        } else if (schema.hasProductIds) {
          columns.push('product_ids');
          values.push(JSON.stringify(newBundle.products));
        }
        if (schema.hasPrice) {
          columns.push('price');
          values.push(newBundle.price);
        } else if (schema.hasBundlePrice) {
          columns.push('bundle_price');
          values.push(newBundle.price);
        }
        if (schema.hasOriginalPrice) {
          columns.push('original_price');
          values.push(newBundle.originalPrice);
        }
        if (schema.hasSavingsPercent) {
          columns.push('savings_percent');
          values.push(getBundleSavingsPercent(newBundle.originalPrice, newBundle.price));
        }
        if (schema.hasStatus) {
          columns.push('status');
          values.push(newBundle.status);
        } else if (schema.hasIsActive) {
          columns.push('is_active');
          values.push(newBundle.status === 'active');
        }
        if (schema.hasImage) {
          columns.push('image');
          values.push(newBundle.image);
        }
        if (schema.hasIsFeatured) {
          columns.push('is_featured');
          values.push(false);
        }
        if (schema.hasLoyaltyPointsBonus) {
          columns.push('loyalty_points_bonus');
          values.push(0);
        }
        if (schema.hasVendorId) {
          columns.push('vendor_id');
          values.push(null);
        }
        if (schema.hasIsPromoted) {
          columns.push('is_promoted');
          values.push(!!isPromoted);
        }
        if (schema.hasCreatedAt) {
          columns.push('created_at');
          values.push(newBundle.createdAt);
        }
        if (schema.hasUpdatedAt) {
          columns.push('updated_at');
          values.push(newBundle.updatedAt);
        }

        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
        const result = await query(
          `INSERT INTO bundles (${columns.join(', ')})
           VALUES (${placeholders}) RETURNING *`,
          values
        );
        if (result.rows[0]) {
          return NextResponse.json(
            { success: true, bundle: enrichBundle(result.rows[0]) },
            { status: 201 }
          );
        }
      } catch {
        // Table may not exist
      }
    }

    // DB unavailable -- return error
    return NextResponse.json(
      { error: 'Database unavailable, cannot create bundle' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Bundle POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create bundle' },
      { status: 500 }
    );
  }
}

// PATCH -- update an existing bundle
export async function PATCH(request: NextRequest) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Bundle id is required' },
        { status: 400 }
      );
    }

    const schema = await getBundleTableSchema();
    if (schema) {
      try {
        const existingResult = await query('SELECT * FROM bundles WHERE id = $1', [id]);
        const existingBundle = existingResult.rows[0];
        if (!existingBundle) {
          return NextResponse.json(
            { error: `Bundle ${id} not found or database unavailable` },
            { status: 404 }
          );
        }

        const now = new Date().toISOString();
        const setClauses: string[] = [];
        const values: any[] = [id];
        let paramIndex = 2;

        if (updates.name !== undefined) {
          setClauses.push(`name = $${paramIndex++}`);
          values.push(updates.name);
        }
        if (updates.nameHe !== undefined && schema.hasNameHe) {
          setClauses.push(`name_he = $${paramIndex++}`);
          values.push(updates.nameHe);
        }
        if (updates.description !== undefined && schema.hasDescription) {
          setClauses.push(`description = $${paramIndex++}`);
          values.push(updates.description);
        }
        if (updates.products !== undefined) {
          if (schema.hasProducts) {
            setClauses.push(`products = $${paramIndex++}`);
            values.push(JSON.stringify(updates.products));
          } else if (schema.hasProductIds) {
            setClauses.push(`product_ids = $${paramIndex++}`);
            values.push(JSON.stringify(updates.products));
          }
        }
        if (updates.price !== undefined) {
          if (schema.hasPrice) {
            setClauses.push(`price = $${paramIndex++}`);
            values.push(updates.price);
          } else if (schema.hasBundlePrice) {
            setClauses.push(`bundle_price = $${paramIndex++}`);
            values.push(updates.price);
          }
        }
        if (updates.originalPrice !== undefined) {
          if (schema.hasOriginalPrice) {
            setClauses.push(`original_price = $${paramIndex++}`);
            values.push(updates.originalPrice);
          }
        }
        if (updates.status !== undefined) {
          if (schema.hasStatus) {
            setClauses.push(`status = $${paramIndex++}`);
            values.push(updates.status);
          } else if (schema.hasIsActive) {
            setClauses.push(`is_active = $${paramIndex++}`);
            values.push(updates.status === 'active');
          }
        }
        if (updates.image !== undefined && schema.hasImage) {
          setClauses.push(`image = $${paramIndex++}`);
          values.push(updates.image);
        }
        // Task #5: home-page promotion toggle. Only one bundle may be
        // promoted at a time — clear all others before setting this one.
        if (updates.isPromoted !== undefined && schema.hasIsPromoted) {
          if (updates.isPromoted === true) {
            await query('UPDATE bundles SET is_promoted = false WHERE is_promoted = true AND id <> $1', [id]);
          }
          setClauses.push(`is_promoted = $${paramIndex++}`);
          values.push(!!updates.isPromoted);
        }
        if (schema.hasSavingsPercent && (updates.price !== undefined || updates.originalPrice !== undefined)) {
          const nextPrice = updates.price !== undefined ? Number(updates.price) || 0 : getBundleRecordPrice(existingBundle);
          const nextOriginalPrice = updates.originalPrice !== undefined
            ? Number(updates.originalPrice) || nextPrice
            : getBundleRecordOriginalPrice(existingBundle);
          setClauses.push(`savings_percent = $${paramIndex++}`);
          values.push(getBundleSavingsPercent(nextOriginalPrice, nextPrice));
        }
        if (schema.hasUpdatedAt) {
          setClauses.push(`updated_at = $${paramIndex++}`);
          values.push(now);
        }

        if (setClauses.length > 0) {
          const result = await query(
            `UPDATE bundles SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
            values
          );
          if (result.rows[0]) {
            return NextResponse.json({
              success: true,
              bundle: enrichBundle(result.rows[0]),
            });
          }
        }
      } catch {
        // Table may not exist
      }
    }

    // DB unavailable or bundle not found
    return NextResponse.json(
      { error: `Bundle ${id} not found or database unavailable` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Bundle PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle' },
      { status: 500 }
    );
  }
}

// DELETE -- remove a bundle
export async function DELETE(request: NextRequest) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bundle id is required as query parameter' },
        { status: 400 }
      );
    }

    // Try DB delete
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const result = await query(
          'DELETE FROM bundles WHERE id = $1 RETURNING id',
          [id]
        );
        if (result.rowCount > 0) {
          return NextResponse.json({
            success: true,
            message: `Bundle ${id} deleted`,
          });
        }
      } catch {
        // Table may not exist
      }
    }

    // DB unavailable or bundle not found
    return NextResponse.json(
      { error: `Bundle ${id} not found or database unavailable` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Bundle DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
