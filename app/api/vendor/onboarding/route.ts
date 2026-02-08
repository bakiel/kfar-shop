import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db/postgres-client';

// Helper to generate vendor slug
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

    // Check if email already exists
    const existingVendor = await query(
      'SELECT id FROM vendors WHERE email = $1',
      [data.email]
    );

    if (existingVendor.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate unique vendor ID and slug
    const vendorId = `vendor-${Date.now()}`;
    const slug = generateSlug(data.storeName);

    // Save to database
    const result = await query(
      `INSERT INTO vendors (
        id, name, name_he, slug, email, password_hash, phone,
        category, description, description_he, logo, banner,
        address, delivery_options, business_hours, about_owner,
        status, featured, created_at, updated_at, metadata, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22
      ) RETURNING id`,
      [
        vendorId,
        data.storeName,
        data.storeNameHe || '',
        slug,
        data.email,
        passwordHash,
        data.phone,
        data.category,
        data.description,
        data.descriptionHe || '',
        data.logo || null,
        data.banner || null,
        data.address || '',
        JSON.stringify(data.deliveryOptions || []),
        JSON.stringify(data.businessHours || {}),
        data.aboutOwner || '',
        'active',
        true, // New vendors are featured for 30 days
        new Date(),
        new Date(),
        JSON.stringify({
          established: new Date().getFullYear().toString(),
          location: 'Dimona, Israel',
          specialty: data.category,
          certifications: ['VOP Approved', 'Vegan', 'Kosher']
        }),
        true
      ]
    );

    // Add products if provided
    if (data.products && data.products.length > 0) {
      for (const product of data.products) {
        await query(
          `INSERT INTO products (
            id, vendor_id, name, name_he, description, price,
            category, image, is_vegan, is_kosher, in_stock,
            created_at, updated_at, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14
          )`,
          [
            `${vendorId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            vendorId,
            product.name,
            product.nameHe || '',
            product.description,
            product.price,
            product.category,
            product.image,
            product.isVegan !== false, // Default true for VOP
            product.isKosher !== false, // Default true for VOP
            product.inStock !== false,
            new Date(),
            new Date(),
            'published'
          ]
        );
      }
    }

    console.log('✅ New vendor successfully onboarded:', {
      vendorId,
      storeName: data.storeName,
      slug: slug,
      productCount: data.products?.length || 0
    });

    return NextResponse.json({
      success: true,
      vendorId,
      slug: slug,
      message: 'Vendor successfully onboarded',
      storeUrl: `/store/${slug}`
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}
