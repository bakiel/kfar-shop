import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/data/wordpress-style-data-layer';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

// Enrich bundle with resolved product details
function enrichBundle(bundle: any) {
  const resolvedProducts = (bundle.products || []).map((pid: string) => {
    const product = getProductById(pid);
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
    resolvedProducts,
    discount: bundle.originalPrice
      ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)
      : 0,
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
        let sql = 'SELECT * FROM bundles';
        const params: any[] = [];

        if (bundleId) {
          sql += ' WHERE id = $1';
          params.push(bundleId);
        } else if (status && status !== 'all') {
          sql += ' WHERE status = $1';
          params.push(status);
        }

        sql += ' ORDER BY created_at DESC';
        const result = await query(sql, params);
        if (result.rows.length > 0) {
          bundles = result.rows;
        }
      } catch {
        // Table may not exist -- return empty result
      }
    }

    const enriched = bundles.map(enrichBundle);

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
    const { name, nameHe, description, products, price, originalPrice, image, status } = body;

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
    const newBundle: any = {
      id: `bundle-${Date.now()}`,
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
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const result = await query(
          `INSERT INTO bundles (id, name, name_he, description, products, price, original_price, status, image, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            newBundle.id,
            newBundle.name,
            newBundle.nameHe,
            newBundle.description,
            JSON.stringify(newBundle.products),
            newBundle.price,
            newBundle.originalPrice,
            newBundle.status,
            newBundle.image,
            newBundle.createdAt,
            newBundle.updatedAt,
          ]
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

    const now = new Date().toISOString();
    updates.updatedAt = now;

    // Try DB update
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const setClauses: string[] = [];
        const values: any[] = [id];
        let paramIndex = 2;

        if (updates.name !== undefined) {
          setClauses.push(`name = $${paramIndex++}`);
          values.push(updates.name);
        }
        if (updates.nameHe !== undefined) {
          setClauses.push(`name_he = $${paramIndex++}`);
          values.push(updates.nameHe);
        }
        if (updates.description !== undefined) {
          setClauses.push(`description = $${paramIndex++}`);
          values.push(updates.description);
        }
        if (updates.products !== undefined) {
          setClauses.push(`products = $${paramIndex++}`);
          values.push(JSON.stringify(updates.products));
        }
        if (updates.price !== undefined) {
          setClauses.push(`price = $${paramIndex++}`);
          values.push(updates.price);
        }
        if (updates.originalPrice !== undefined) {
          setClauses.push(`original_price = $${paramIndex++}`);
          values.push(updates.originalPrice);
        }
        if (updates.status !== undefined) {
          setClauses.push(`status = $${paramIndex++}`);
          values.push(updates.status);
        }
        if (updates.image !== undefined) {
          setClauses.push(`image = $${paramIndex++}`);
          values.push(updates.image);
        }
        // Task #5: home-page promotion toggle. Only one bundle may be
        // promoted at a time — clear all others before setting this one.
        if (updates.isPromoted !== undefined) {
          if (updates.isPromoted === true) {
            await query('UPDATE bundles SET is_promoted = false WHERE is_promoted = true AND id <> $1', [id]);
          }
          setClauses.push(`is_promoted = $${paramIndex++}`);
          values.push(!!updates.isPromoted);
        }
        setClauses.push(`updated_at = $${paramIndex++}`);
        values.push(now);

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
