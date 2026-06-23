import type { CartItem } from '@/lib/context/CartContext';
import type { Bundle } from '@/lib/types/landing';

type CartBundle = Pick<Bundle, 'id' | 'name' | 'bundlePrice' | 'originalPrice' | 'image' | 'products' | 'vendorId' | 'vendorName'>;

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function createBundleCartItem(bundle: CartBundle): CartItem {
  return {
    id: `bundle:${bundle.id}`,
    itemType: 'bundle',
    bundleId: bundle.id,
    bundleName: bundle.name,
    bundleProductIds: bundle.products.map((product) => product.id).filter(Boolean),
    name: bundle.name,
    vendorId: bundle.vendorId || 'kfar-marketplace',
    vendorName: bundle.vendorName || 'KFAR Marketplace',
    price: roundMoney(bundle.bundlePrice),
    originalPrice: roundMoney(bundle.originalPrice),
    quantity: 1,
    image: bundle.image,
  };
}
