/**
 * Cart Agent for KFAR AI Shopping Assistant
 * Handles cart operations with context integration
 */

import { getProductById } from '@/lib/data/wordpress-style-data-layer';
import type { CartSummary, CartItemSummary } from '../events/shopping-events';

// Cart item interface (matches CartContext)
export interface CartItem {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity?: number;
  bulkPricing?: Array<{ quantity: number; price: number }>;
  originalPrice?: number;
}

// Cart operation result
export interface CartResult {
  success: boolean;
  message: string;
  messageHe?: string;
  item?: CartItem;
  cart?: CartItem[];
  summary?: CartSummary;
}

export class CartAgent {
  /**
   * Add a product to cart
   * Returns the item to add (client-side will update context)
   */
  async addToCart(productId: string, quantity: number = 1, currentCart: CartItem[] = []): Promise<CartResult> {
    // Get product details from data layer
    const product = getProductById(productId);

    if (!product) {
      return {
        success: false,
        message: `Product not found: ${productId}`,
        messageHe: `מוצר לא נמצא: ${productId}`,
      };
    }

    if (product.inStock === false) {
      return {
        success: false,
        message: `Sorry, ${product.name} is currently out of stock.`,
        messageHe: `מצטערים, ${product.nameHe || product.name} אזל מהמלאי.`,
      };
    }

    // Create cart item
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      vendorId: product.vendorId || '',
      vendorName: product.vendorName || '',
      price: product.price,
      quantity,
      image: product.image || '/images/placeholder-product.jpg',
      originalPrice: product.originalPrice,
    };

    // Check if already in cart
    const existingItem = currentCart.find(item => item.id === productId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    return {
      success: true,
      message: `Added ${quantity} x ${product.name} to your cart!`,
      messageHe: `נוסף ${quantity} x ${product.nameHe || product.name} לעגלה!`,
      item: { ...cartItem, quantity: existingItem ? quantity : cartItem.quantity },
      summary: this.calculateSummary([
        ...currentCart.filter(i => i.id !== productId),
        { ...cartItem, quantity: newQuantity }
      ]),
    };
  }

  /**
   * Remove a product from cart
   */
  async removeFromCart(productId: string, currentCart: CartItem[]): Promise<CartResult> {
    const item = currentCart.find(i => i.id === productId);

    if (!item) {
      return {
        success: false,
        message: `Product not found in your cart.`,
        messageHe: `המוצר לא נמצא בעגלה שלך.`,
      };
    }

    const newCart = currentCart.filter(i => i.id !== productId);

    return {
      success: true,
      message: `Removed ${item.name} from your cart.`,
      messageHe: `הוסר ${item.name} מהעגלה שלך.`,
      cart: newCart,
      summary: this.calculateSummary(newCart),
    };
  }

  /**
   * Update quantity of a product in cart
   */
  async updateQuantity(productId: string, quantity: number, currentCart: CartItem[]): Promise<CartResult> {
    if (quantity <= 0) {
      return this.removeFromCart(productId, currentCart);
    }

    const item = currentCart.find(i => i.id === productId);

    if (!item) {
      return {
        success: false,
        message: `Product not found in your cart.`,
        messageHe: `המוצר לא נמצא בעגלה שלך.`,
      };
    }

    const newCart = currentCart.map(i =>
      i.id === productId ? { ...i, quantity } : i
    );

    return {
      success: true,
      message: `Updated ${item.name} quantity to ${quantity}.`,
      messageHe: `הכמות של ${item.name} עודכנה ל-${quantity}.`,
      cart: newCart,
      summary: this.calculateSummary(newCart),
    };
  }

  /**
   * Get cart summary
   */
  async getCartSummary(currentCart: CartItem[]): Promise<CartSummary> {
    return this.calculateSummary(currentCart);
  }

  /**
   * Clear the entire cart
   */
  async clearCart(): Promise<CartResult> {
    return {
      success: true,
      message: 'Your cart has been cleared.',
      messageHe: 'העגלה שלך נוקתה.',
      cart: [],
      summary: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        currency: 'ILS',
      },
    };
  }

  /**
   * Generate a natural language cart description
   */
  describeCart(cart: CartItem[], language: 'en' | 'he' = 'en'): string {
    if (cart.length === 0) {
      return language === 'he'
        ? 'העגלה שלך ריקה.'
        : 'Your cart is empty.';
    }

    const summary = this.calculateSummary(cart);

    if (language === 'he') {
      const itemList = cart.map(item =>
        `${item.quantity} x ${item.name} (₪${(item.price * item.quantity).toFixed(2)})`
      ).join(', ');

      return `יש לך ${summary.totalItems} פריטים בעגלה: ${itemList}. סה"כ: ₪${summary.subtotal.toFixed(2)}`;
    }

    const itemList = cart.map(item =>
      `${item.quantity} x ${item.name} (₪${(item.price * item.quantity).toFixed(2)})`
    ).join(', ');

    return `You have ${summary.totalItems} item${summary.totalItems > 1 ? 's' : ''} in your cart: ${itemList}. Total: ₪${summary.subtotal.toFixed(2)}`;
  }

  /**
   * Calculate cart summary with bulk pricing
   */
  private calculateSummary(cart: CartItem[]): CartSummary {
    const items: CartItemSummary[] = cart.map(item => {
      // Apply bulk pricing if available
      let effectivePrice = item.price;
      if (item.bulkPricing && item.bulkPricing.length > 0) {
        const applicableBulk = item.bulkPricing
          .filter(bulk => item.quantity >= bulk.quantity)
          .sort((a, b) => b.quantity - a.quantity)[0];

        if (applicableBulk) {
          effectivePrice = applicableBulk.price;
        }
      }

      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: effectivePrice,
        image: item.image,
      };
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      items,
      totalItems,
      subtotal,
      currency: 'ILS',
    };
  }

  /**
   * Get vendor breakdown of cart
   */
  getVendorBreakdown(cart: CartItem[]): Record<string, { items: CartItem[]; subtotal: number }> {
    return cart.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = { items: [], subtotal: 0 };
      }
      acc[item.vendorId].items.push(item);
      acc[item.vendorId].subtotal += item.price * item.quantity;
      return acc;
    }, {} as Record<string, { items: CartItem[]; subtotal: number }>);
  }

  /**
   * Check if checkout is possible
   */
  canCheckout(cart: CartItem[]): { canCheckout: boolean; reason?: string; reasonHe?: string } {
    if (cart.length === 0) {
      return {
        canCheckout: false,
        reason: 'Your cart is empty.',
        reasonHe: 'העגלה שלך ריקה.',
      };
    }

    const total = this.calculateSummary(cart).subtotal;
    if (total < 25) {
      return {
        canCheckout: false,
        reason: `Minimum order is ₪25. Your current total is ₪${total.toFixed(2)}.`,
        reasonHe: `הזמנה מינימלית היא ₪25. הסכום הנוכחי שלך הוא ₪${total.toFixed(2)}.`,
      };
    }

    return { canCheckout: true };
  }
}

// Singleton instance
export const cartAgent = new CartAgent();
