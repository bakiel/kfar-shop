import { query } from '@/lib/db/postgres-client';
import {
  getBundleRecordStatus,
  normalizeBundleRecord,
} from '@/lib/db/bundles';

type CartInputItem = {
  id?: string;
  productId?: string;
  product_id?: string;
  itemType?: 'product' | 'bundle';
  bundleId?: string;
  bundle_id?: string;
  quantity?: number;
};

export interface ResolvedOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  vendorId: string;
  vendorName: string;
  image: string;
  itemType?: 'product' | 'bundle';
  bundleId?: string;
  bundleProductIds?: string[];
}

export interface OrderQuote {
  items: ResolvedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: 'ILS';
}

const MAX_QUANTITY_PER_ITEM = 99;

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QUANTITY_PER_ITEM) {
    return null;
  }
  return quantity;
}

function getInputProductId(item: CartInputItem) {
  return String(item.productId || item.id || item.product_id || '').trim();
}

function getInputBundleId(item: CartInputItem) {
  const explicit = String(item.bundleId || item.bundle_id || '').trim();
  if (explicit) return explicit;

  const rawId = String(item.id || item.productId || item.product_id || '').trim();
  if (item.itemType === 'bundle' && rawId.startsWith('bundle:')) {
    return rawId.slice('bundle:'.length);
  }

  return '';
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value
        .replace(/^{|}$/g, '')
        .split(',')
        .map((item) => item.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }
  }
  return [];
}

function isOrderableStatus(status: string | null | undefined) {
  return status === 'published' || status === 'active';
}

export function totalsMatch(clientTotal: unknown, quoteTotal: number) {
  const parsed = Number(clientTotal);
  return Number.isFinite(parsed) && Math.abs(roundMoney(parsed) - quoteTotal) <= 0.01;
}

export async function resolveOrderQuote(items: CartInputItem[]): Promise<OrderQuote> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items in order');
  }

  const requested = new Map<string, number>();
  const requestedBundles = new Map<string, number>();
  for (const item of items) {
    const quantity = parseQuantity(item.quantity);
    if (!quantity) throw new Error('Each order item must include a valid quantity');

    const bundleId = getInputBundleId(item);
    if (bundleId) {
      requestedBundles.set(bundleId, (requestedBundles.get(bundleId) || 0) + quantity);
      continue;
    }

    const productId = getInputProductId(item);
    if (!productId) throw new Error('Each order item must include a product ID');
    requested.set(productId, (requested.get(productId) || 0) + quantity);
  }

  const productIds = [...requested.keys()];
  const { rows } = productIds.length > 0
    ? await query(
      `SELECT
         p.id::text,
         p.vendor_id::text,
         p.name,
         p.price,
         p.image_url,
         p.image_gallery,
         p.status,
         p.in_stock,
         v.name AS vendor_name
       FROM products p
       LEFT JOIN vendors v ON v.id::text = p.vendor_id::text
       WHERE p.id::text = ANY($1::text[])`,
      [productIds]
    )
    : { rows: [] };

  const productsById = new Map(rows.map((row: any) => [String(row.id), row]));
  const resolvedItems: ResolvedOrderItem[] = [];

  const bundleIds = [...requestedBundles.keys()];
  if (bundleIds.length > 0) {
    const { rows: bundleRows } = await query(
      'SELECT * FROM bundles WHERE id::text = ANY($1::text[])',
      [bundleIds]
    );
    const bundlesById = new Map(bundleRows.map((row: any) => [String(row.id), row]));

    for (const bundleId of bundleIds) {
      const bundleRow = bundlesById.get(bundleId);
      if (!bundleRow) {
        throw new Error(`Bundle ${bundleId} is no longer available`);
      }
      if (getBundleRecordStatus(bundleRow) !== 'active') {
        throw new Error(`${bundleRow.name || bundleId} is not currently available`);
      }

      const normalized = normalizeBundleRecord(bundleRow) as any;
      const quantity = requestedBundles.get(bundleId) || 0;
      const price = roundMoney(normalized.price);
      if (price <= 0) {
        throw new Error(`${normalized.name || bundleId} cannot be ordered right now`);
      }
      if (!Array.isArray(normalized.products) || normalized.products.length === 0) {
        throw new Error(`${normalized.name || bundleId} does not have orderable products`);
      }

      const { rows: bundleProductRows } = await query(
        `SELECT p.id::text
         FROM products p
         WHERE p.id::text = ANY($1::text[])
           AND p.status IN ('published', 'active')
           AND COALESCE(p.in_stock, true) = true`,
        [normalized.products]
      );
      const orderableProductIds = new Set(bundleProductRows.map((row: any) => String(row.id).toLowerCase()));
      const missingProductIds = normalized.products.filter((productId: string) => !orderableProductIds.has(productId.toLowerCase()));
      if (missingProductIds.length > 0) {
        throw new Error(`${normalized.name || bundleId} is missing orderable products`);
      }

      resolvedItems.push({
        id: `bundle:${normalized.id}`,
        productId: `bundle:${normalized.id}`,
        itemType: 'bundle',
        bundleId: normalized.id,
        bundleProductIds: normalized.products,
        name: normalized.name || 'Bundle',
        quantity,
        price,
        vendorId: normalized.vendorId || '',
        vendorName: normalized.vendorId || 'KFAR Marketplace',
        image: normalized.image || '/images/placeholder-product.jpg',
      });
    }
  }

  for (const productId of productIds) {
    const product = productsById.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} is no longer available`);
    }
    if (!isOrderableStatus(product.status) || product.in_stock === false) {
      throw new Error(`${product.name || productId} is not currently available`);
    }

    const quantity = requested.get(productId) || 0;
    const price = roundMoney(Number(product.price) || 0);
    if (price <= 0) {
      throw new Error(`${product.name || productId} cannot be ordered right now`);
    }

    const images = toStringArray(product.image_gallery);
    const image = product.image_url || images[0] || '/images/placeholder-product.jpg';

    resolvedItems.push({
      id: product.id,
      productId: product.id,
      name: product.name || product.id,
      quantity,
      price,
      vendorId: product.vendor_id || '',
      vendorName: product.vendor_name || product.vendor_id || 'Marketplace Vendor',
      image,
    });
  }

  const subtotal = roundMoney(resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = 0;
  const total = roundMoney(subtotal + deliveryFee);

  return {
    items: resolvedItems,
    subtotal,
    deliveryFee,
    total,
    currency: 'ILS',
  };
}
