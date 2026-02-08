import { query } from '@/lib/db/postgres-client';

interface VendorOnboardingData {
  storeName: string;
  storeNameHe: string;
  category: string;
  description: string;
  descriptionHe: string;
  logo: string | null;
  banner: string | null;
  phone: string;
  email: string;
  password: string;
  address: string;
  deliveryOptions: string[];
  businessHours: any;
  products: any[];
}

interface CustomerOnboardingData {
  phone: string;
  name: string;
  email?: string;
  language: string;
  currency: string;
  dietary: string[];
  address?: {
    street: string;
    city: string;
    postalCode: string;
  };
}

export const onboardingService = {
  async createVendor(data: VendorOnboardingData) {
    try {
      // Generate vendor ID
      const vendorId = `vendor-${Date.now()}`;
      const slug = data.storeName.toLowerCase().replace(/\s+/g, '-');

      // Create vendor profile in PostgreSQL
      const { rows } = await query(
        `INSERT INTO vendors (
          id, name, name_he, slug, category, description, description_he,
          logo, banner, phone, email, address, delivery_options,
          business_hours, status, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        RETURNING *`,
        [
          vendorId,
          data.storeName,
          data.storeNameHe,
          slug,
          data.category,
          data.description,
          data.descriptionHe,
          data.logo,
          data.banner,
          data.phone,
          data.email,
          data.address,
          JSON.stringify(data.deliveryOptions),
          JSON.stringify(data.businessHours),
          'active',
          true
        ]
      );

      const vendor = rows[0];

      if (!vendor) {
        throw new Error('Failed to create vendor profile');
      }

      // Add products
      if (data.products && data.products.length > 0) {
        for (const product of data.products) {
          try {
            const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const productSlug = product.name.toLowerCase().replace(/\s+/g, '-');

            await query(
              `INSERT INTO products (
                id, vendor_id, name, name_he, slug, description, description_he,
                price, category, image, is_vegan, is_kosher, in_stock,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
              [
                productId,
                vendor.id,
                product.name,
                product.nameHe,
                productSlug,
                product.description,
                product.descriptionHe,
                product.price,
                product.category,
                product.image,
                product.isVegan || true,
                product.isKosher || false,
                product.inStock !== false
              ]
            );
          } catch (productError) {
            console.error('Warning: Failed to add product:', productError);
            // Don't throw here - vendor is created, products can be added later
          }
        }
      }

      return {
        success: true,
        vendorId: vendor.id,
        vendor
      };
    } catch (error: any) {
      console.error('Vendor onboarding error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create vendor account'
      };
    }
  },

  async createCustomer(data: CustomerOnboardingData) {
    try {
      const customerId = `cust-${Date.now()}`;
      const qrCode = `KFAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create customer in PostgreSQL
      const { rows } = await query(
        `INSERT INTO customers (
          id, phone, name, email, language_preference, dietary_restrictions,
          location, preferences, points, lifetime_points, loyalty_tier,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          customerId,
          data.phone,
          data.name,
          data.email,
          data.language,
          JSON.stringify(data.dietary),
          data.address ? JSON.stringify(data.address) : null,
          JSON.stringify({
            currency: data.currency,
            qr_code: qrCode
          }),
          0,
          0,
          'bronze'
        ]
      );

      const customer = rows[0];

      if (!customer) {
        throw new Error('Failed to create customer');
      }

      return {
        success: true,
        customerId: customer.id,
        customer: {
          ...customer,
          qrCode: qrCode // Use the generated QR code
        }
      };
    } catch (error: any) {
      console.error('Customer onboarding error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create customer account'
      };
    }
  },

  async getVendor(vendorId: string) {
    try {
      const { rows } = await query(
        `SELECT * FROM vendors WHERE id = $1`,
        [vendorId]
      );

      if (rows.length === 0) {
        throw new Error('Vendor not found');
      }

      return { success: true, vendor: rows[0] };
    } catch (error: any) {
      console.error('Get vendor error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get vendor'
      };
    }
  },

  async getCustomer(customerId: string) {
    try {
      const { rows } = await query(
        `SELECT * FROM customers WHERE id = $1`,
        [customerId]
      );

      if (rows.length === 0) {
        throw new Error('Customer not found');
      }

      return { success: true, customer: rows[0] };
    } catch (error: any) {
      console.error('Get customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get customer'
      };
    }
  }
};
