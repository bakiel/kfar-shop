// Shared vendor-creation logic used by both the public self-serve onboarding route
// (app/api/vendor/onboarding) and the admin-assisted route (app/api/admin/vendors).
//
// Both paths create the same records (vendor + login user + optional initial products);
// the only difference is what the HTTP layer does afterwards (the public route issues a
// vendor JWT + refresh cookie so the new vendor is logged in; the admin route stays logged
// in as admin and hands the credentials over). Keeping the DB writes in one place avoids
// the two routes drifting apart.

import bcrypt from 'bcryptjs';
import { query, transaction } from '@/lib/db/postgres-client';

export interface VendorProductInput {
  name: string;
  nameHe?: string;
  description?: string;
  price: number | string;
  category?: string;
  image?: string | null;
  isVegan?: boolean;
  isKosher?: boolean;
  inStock?: boolean;
}

export interface CreateVendorInput {
  storeName: string;
  storeNameHe?: string;
  category: string;
  description: string;
  descriptionHe?: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  logo?: string | null;
  banner?: string | null;
  deliveryOptions?: string[];
  businessHours?: Record<string, unknown>;
  aboutOwner?: string;
  products?: VendorProductInput[];
}

export interface CreateVendorResult {
  vendorId: string;
  slug: string;
  userId: string;
}

export class VendorOnboardingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'VendorOnboardingError';
    this.status = status;
  }
}

export function generateVendorSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const REQUIRED_FIELDS: (keyof CreateVendorInput)[] = [
  'storeName',
  'category',
  'description',
  'email',
  'phone',
  'password',
];

/**
 * Create a vendor account (vendors row + users login row + optional products).
 * Throws VendorOnboardingError with an appropriate HTTP status on validation/conflict.
 */
export async function createVendorAccount(
  data: CreateVendorInput
): Promise<CreateVendorResult> {
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      throw new VendorOnboardingError(`Missing required field: ${field}`, 400);
    }
  }

  if (data.password.length < 8) {
    throw new VendorOnboardingError('Password must be at least 8 characters', 400);
  }

  // Email must be unique across both vendors and users.
  const [existingVendor, existingUser] = await Promise.all([
    query('SELECT id FROM vendors WHERE email = $1', [data.email]),
    query('SELECT id FROM users WHERE email = $1', [data.email]),
  ]);
  if (existingVendor.rows.length > 0 || existingUser.rows.length > 0) {
    throw new VendorOnboardingError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  // Random suffix guards against two registrations landing in the same millisecond.
  const vendorId = `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Make slug unique.
  let slug = generateVendorSlug(data.storeName);
  const slugCheck = await query('SELECT id FROM vendors WHERE slug = $1', [slug]);
  if (slugCheck.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  // All three inserts (vendor + login user + products) run in one transaction so a
  // mid-way failure never leaves an orphaned vendor with no login (or vice versa).
  const userId = await transaction(async (client) => {
    // 1. Vendor row.
    await client.query(
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

    // 2. Login user.
    const userResult = await client.query(
      `INSERT INTO users (
        email, password_hash, role, vendor_id, display_name,
        email_verified, is_active, created_at, updated_at
      ) VALUES ($1, $2, 'vendor', $3, $4, true, true, NOW(), NOW())
      RETURNING id`,
      [data.email, passwordHash, vendorId, data.storeName]
    );

    // 3. Optional initial products.
    if (data.products && data.products.length > 0) {
      let i = 0;
      for (const product of data.products) {
        const productId = `${vendorId}-${i++}-${Math.random().toString(36).slice(2, 11)}`;
        await client.query(
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

    return userResult.rows[0]?.id as string;
  });

  return { vendorId, slug, userId };
}
