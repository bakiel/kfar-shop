import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, query } from '@/lib/db/postgres-client';

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
    const existingVendor = await db.vendors.findByEmail(data.email);

    if (existingVendor) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate unique slug
    const slug = generateSlug(data.storeName);
    const vendorId = `vendor-${Date.now()}`;

    // Save vendor to PostgreSQL
    const newVendor = await db.vendors.create({
      id: vendorId,
      email: data.email,
      password_hash: passwordHash,
      business_name: data.storeName,
      owner_name: data.ownerName || data.storeName,
      phone: data.phone,
      whatsapp: data.phone,
      address: data.address || '',
      logo_url: data.logo || null,
      banner_url: data.banner || null,
      category: data.category,
      description: data.description,
      business_hours: JSON.stringify(data.businessHours || {}),
      name: data.storeName,
      name_he: data.storeNameHe || '',
      description_he: data.descriptionHe || '',
      slug: slug,
      about_owner: data.aboutOwner || '',
      delivery_options: JSON.stringify(data.deliveryOptions || []),
      status: 'active',
      featured: true,
      verified: true,
      primary_color: data.primaryColor || '#478c0b',
      secondary_color: data.secondaryColor || '#f6af0d',
      accent_color: data.accentColor || '#c23c09',
      metadata: JSON.stringify({
        established: new Date().getFullYear().toString(),
        location: 'Dimona, Israel',
        specialty: data.category,
        certifications: ['VOP Approved', 'Vegan', 'Kosher']
      }),
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Add products if provided
    if (data.products && data.products.length > 0 && newVendor) {
      for (let i = 0; i < data.products.length; i++) {
        const product = data.products[i];
        try {
          await db.products.create({
            id: `${vendorId}-${Date.now()}-${i}`,
            vendor_id: vendorId,
            name: product.name,
            name_he: product.nameHe || '',
            description: product.description || '',
            description_he: product.descriptionHe || '',
            short_description: product.description ? product.description.substring(0, 100) : '',
            price: product.price,
            compare_at_price: product.originalPrice || null,
            original_price: product.originalPrice || null,
            category: product.category || data.category,
            main_image_url: product.image || null,
            primary_image: product.image || null,
            is_vegan: product.isVegan !== false,
            is_kosher: product.isKosher !== false,
            is_organic: product.isOrganic || false,
            is_gluten_free: product.isGlutenFree || false,
            in_stock: product.inStock !== false,
            stock_quantity: product.stockQuantity || 100,
            status: 'published',
            is_active: true,
            is_featured: i === 0,
            sku: `SKU-${vendorId.substring(0, 8)}-${i + 1}`,
            slug: generateSlug(product.name),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (productError) {
          console.error('Error creating product:', productError);
          // Don't fail the whole onboarding if products fail
        }
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
      message: 'Vendor successfully onboarded! Your store is now live.',
      storeUrl: `/store/${slug}`,
      dashboardUrl: `/vendor/dashboard`,
      loginCredentials: {
        email: data.email,
        message: 'Use your password to login'
      }
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if email exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const vendor = await db.vendors.findByEmail(email);

    return NextResponse.json({
      exists: !!vendor,
      vendor: vendor ? { id: vendor.id, name: vendor.name } : null
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    );
  }
}
