import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db/postgres-client';
import { generateTokensForUser } from '@/lib/services/auth-service';

function generateSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['storeName', 'category', 'description', 'email', 'phone', 'password'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (data.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check email not already taken (in either vendors or users table)
    const [existingVendor, existingUser] = await Promise.all([
      query('SELECT id FROM vendors WHERE email = $1', [data.email]),
      query('SELECT id FROM users WHERE email = $1', [data.email]),
    ]);
    if (existingVendor.rows.length > 0 || existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const vendorId = `vendor-${Date.now()}`;

    // Make slug unique
    let slug = generateSlug(data.storeName);
    const slugCheck = await query('SELECT id FROM vendors WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // ── 1. Insert into vendors table (using real column names) ──────────────
    await query(
      `INSERT INTO vendors (
        id, name, name_he, slug, email, password_hash, phone,
        category, description, description_he,
        logo_url, banner_url,
        address, delivery_options, business_hours, about_owner,
        status, featured, is_featured,
        created_at, updated_at, metadata, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19,
        NOW(), NOW(), $20, true
      )`,
      [
        vendorId,
        data.storeName,
        data.storeNameHe || data.storeName,
        slug,
        data.email,
        passwordHash,
        data.phone,
        data.category,
        data.description,
        data.descriptionHe || data.description,
        data.logo || null,
        data.banner || null,
        data.address || '',
        // delivery_options is text[] — pass as postgres array literal
        data.deliveryOptions && data.deliveryOptions.length > 0
          ? data.deliveryOptions
          : ['pickup', 'delivery'],
        JSON.stringify(data.businessHours || {}),
        data.aboutOwner || '',
        'active',
        true,
        true,
        JSON.stringify({
          established: new Date().getFullYear().toString(),
          location: 'Dimona, Israel',
          specialty: data.category,
          certifications: ['VOP Approved', 'Vegan', 'Kosher'],
        }),
      ]
    );

    // ── 2. Create users entry so vendor can log in via JWT ──────────────────
    const userResult = await query(
      `INSERT INTO users (
        email, password_hash, role, vendor_id, display_name,
        email_verified, is_active, created_at, updated_at
      ) VALUES ($1, $2, 'vendor', $3, $4, true, true, NOW(), NOW())
      RETURNING id`,
      [data.email, passwordHash, vendorId, data.storeName]
    );
    const userId = userResult.rows[0]?.id;

    // ── 3. Insert initial products ──────────────────────────────────────────
    if (data.products && data.products.length > 0) {
      for (const product of data.products) {
        const productId = `${vendorId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await query(
          `INSERT INTO products (
            id, vendor_id, name, name_he, description, price,
            category, image_url,
            is_vegan, is_kosher, in_stock, stock_quantity,
            created_at, updated_at, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8,
            $9, $10, $11, $12,
            NOW(), NOW(), 'published'
          )`,
          [
            productId,
            vendorId,
            product.name,
            product.nameHe || '',
            product.description || '',
            product.price,
            product.category || data.category,
            product.image || null,
            product.isVegan !== false,
            product.isKosher !== false,
            product.inStock !== false,
            product.inStock !== false ? 100 : 0,
          ]
        );
      }
    }

    // ── 4. Issue JWT so vendor is immediately logged in ─────────────────────
    const tokens = await generateTokensForUser({
      id: userId,
      email: data.email,
      role: 'vendor',
      vendorId,
      displayName: data.storeName,
      isActive: true,
    });

    console.log('✅ New vendor onboarded:', { vendorId, storeName: data.storeName, slug, products: data.products?.length || 0 });

    const response = NextResponse.json({
      success: true,
      vendorId,
      slug,
      storeUrl: `/store/${slug}`,
      userId,
      accessToken: tokens.accessToken,
      message: 'Vendor successfully onboarded',
    });

    // Set refresh token cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}
