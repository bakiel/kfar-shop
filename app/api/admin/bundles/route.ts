import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/data/wordpress-style-data-layer';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

// In-memory mock bundles -- used as primary source and as fallback
const mockBundles: any[] = [
  {
    id: 'bundle-1',
    name: 'Shabbat Essentials',
    nameHe: '\u05D7\u05D1\u05D9\u05DC\u05EA \u05E9\u05D1\u05EA',
    description: 'Everything you need for a perfect Shabbat dinner',
    products: ['teva-deli-1', 'queens-cuisine-1', 'gahn-delight-1'],
    price: 89,
    originalPrice: 120,
    status: 'active',
    image: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'bundle-2',
    name: 'Healthy Breakfast Pack',
    nameHe: '\u05D7\u05D1\u05D9\u05DC\u05EA \u05D0\u05E8\u05D5\u05D7\u05EA \u05D1\u05D5\u05E7\u05E8 \u05D1\u05E8\u05D9\u05D0\u05D4',
    description: 'Start your day with plant-based goodness',
    products: ['teva-deli-5', 'garden-of-light-1'],
    price: 55,
    originalPrice: 72,
    status: 'active',
    image: '/images/vendors/Garden of Light Logo.jpg',
    createdAt: '2025-01-20T14:30:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'bundle-3',
    name: 'Party Platter',
    nameHe: '\u05DE\u05D2\u05E9 \u05DE\u05E1\u05D9\u05D1\u05D4',
    description: 'Catering-ready selections for your next event',
    products: ['queens-cuisine-2', 'queens-cuisine-3', 'gahn-delight-2'],
    price: 145,
    originalPrice: 195,
    status: 'draft',
    image: '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-02-01T09:00:00Z',
  },
];

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
        // Table may not exist -- fall through to mock data
      }
    }

    // Fallback to mock data
    if (bundles.length === 0) {
      bundles = [...mockBundles];

      if (bundleId) {
        bundles = bundles.filter((b) => b.id === bundleId);
      } else if (status && status !== 'all') {
        bundles = bundles.filter((b) => b.status === status);
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
        // Table may not exist -- store in mock array
      }
    }

    // Fallback: add to in-memory mock data
    mockBundles.push(newBundle);

    return NextResponse.json(
      { success: true, bundle: enrichBundle(newBundle) },
      { status: 201 }
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
        // Fall through to mock update
      }
    }

    // Fallback: update in-memory mock data
    const bundleIndex = mockBundles.findIndex((b) => b.id === id);
    if (bundleIndex === -1) {
      return NextResponse.json(
        { error: `Bundle ${id} not found` },
        { status: 404 }
      );
    }

    mockBundles[bundleIndex] = { ...mockBundles[bundleIndex], ...updates };

    return NextResponse.json({
      success: true,
      bundle: enrichBundle(mockBundles[bundleIndex]),
    });
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
        // Fall through to mock delete
      }
    }

    // Fallback: remove from in-memory mock data
    const bundleIndex = mockBundles.findIndex((b) => b.id === id);
    if (bundleIndex === -1) {
      return NextResponse.json(
        { error: `Bundle ${id} not found` },
        { status: 404 }
      );
    }

    mockBundles.splice(bundleIndex, 1);

    return NextResponse.json({
      success: true,
      message: `Bundle ${id} deleted`,
    });
  } catch (error) {
    console.error('Bundle DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
