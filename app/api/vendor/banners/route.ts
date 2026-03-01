import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    try {
      // Get active banners from PostgreSQL database
      const { rows: banners } = await query(
        `SELECT * FROM vendor_banners
         WHERE vendor_id = $1 AND is_active = true
         ORDER BY order_position ASC`,
        [vendorId]
      );

      if (banners.length > 0) {
        return NextResponse.json({ banners });
      }
    } catch (dbError) {
      console.log('Database operation failed, returning empty banners');
    }

    // DB unavailable -- return empty array
    return NextResponse.json({ banners: [] });
  } catch (error) {
    console.error('Error fetching vendor banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vendor_id, title, subtitle, template, content, start_date, end_date, order_position } = body;

    // Prevent cross-vendor banner creation
    if (vendor_id !== user.vendorId) {
      return NextResponse.json({ error: 'Forbidden: cannot create banners for another vendor' }, { status: 403 });
    }

    // Validate required fields
    if (!vendor_id || !title || !template) {
      return NextResponse.json(
        { error: 'Vendor ID, title, and template are required' },
        { status: 400 }
      );
    }

    // Validate template
    const validTemplates = ['sale', 'announcement', 'product', 'event', 'seasonal', 'custom'];
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: 'Invalid template type' },
        { status: 400 }
      );
    }

    try {
      // Create banner in PostgreSQL
      const { rows } = await query(
        `INSERT INTO vendor_banners (
          vendor_id, title, subtitle, template, content,
          start_date, end_date, order_position, is_active,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
        RETURNING *`,
        [
          vendor_id,
          title,
          subtitle || null,
          template,
          JSON.stringify(content || {}),
          start_date || null,
          end_date || null,
          order_position || 0
        ]
      );

      return NextResponse.json({
        success: true,
        banner: rows[0]
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database unavailable, cannot create banner' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error creating vendor banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bannerId = searchParams.get('id');

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    try {
      // Update banner in PostgreSQL
      const updates = { ...body, updated_at: new Date().toISOString() };
      const keys = Object.keys(updates);
      const values = Object.values(updates);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

      const { rows } = await query(
        `UPDATE vendor_banners SET ${sets} WHERE id = $1 RETURNING *`,
        [bannerId, ...values]
      );

      return NextResponse.json({
        success: true,
        banner: rows[0]
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database unavailable, cannot update banner' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error updating vendor banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bannerId = searchParams.get('id');

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    try {
      // Delete banner from PostgreSQL
      await query('DELETE FROM vendor_banners WHERE id = $1', [bannerId]);

      return NextResponse.json({
        success: true,
        message: 'Banner deleted successfully'
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database unavailable, cannot delete banner' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error deleting vendor banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
