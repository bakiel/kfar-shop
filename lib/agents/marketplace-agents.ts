// KFAR Marketplace AI Agents System
// Practical automated assistants for marketplace operations

import { LucideIcon, Store, Headset, Truck, Wand2, Coins, Users, FileText, TrendingUp, Plus, Package, MessageCircle, AlertCircle, Search, Hash, QrCode, History, Map, Leaf, CheckCircle, MapPin, Tag } from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  icon: LucideIcon;
  color: string;
  capabilities: string[];
  isActive: boolean;
}

export const MARKETPLACE_AGENTS: Agent[] = [
  {
    id: 'vendor-support',
    name: 'Vendor Support Agent',
    nameHe: 'סוכן תמיכה לספקים',
    description: 'Helps vendors with onboarding, product management, and sales',
    icon: Store,
    color: '#478c0b',
    capabilities: [
      'Vendor onboarding assistance',
      'Product listing optimization',
      'Sales analytics insights',
      'Order management help',
      'Invoice generation support'
    ],
    isActive: true
  },
  {
    id: 'customer-service',
    name: 'Customer Service Bot',
    nameHe: 'בוט שירות לקוחות',
    description: 'Assists customers with orders, payments, and general inquiries',
    icon: Headset,
    color: '#f6af0d',
    capabilities: [
      'Order status tracking',
      'Payment assistance',
      'Product information',
      'Delivery updates',
      'Return/refund guidance'
    ],
    isActive: true
  },
  {
    id: 'order-tracker',
    name: 'Order Tracking Assistant',
    nameHe: 'עוזר מעקב הזמנות',
    description: 'Provides real-time order status and delivery updates',
    icon: Truck,
    color: '#c23c09',
    capabilities: [
      'Real-time order status',
      'Delivery time estimates',
      'Vendor communication',
      'WhatsApp notifications',
      'QR code tracking'
    ],
    isActive: true
  },
  {
    id: 'product-advisor',
    name: 'Product Recommendation Agent',
    nameHe: 'יועץ מוצרים',
    description: 'Suggests products based on preferences and VOP dietary requirements',
    icon: Wand2,
    color: '#3a3a1d',
    capabilities: [
      'Personalized recommendations',
      'VOP compliance checking',
      'Dietary restriction filtering',
      'Price comparison',
      'Similar product suggestions'
    ],
    isActive: true
  },
  {
    id: 'payment-helper',
    name: 'Payment Assistant',
    nameHe: 'עוזר תשלומים',
    description: 'Guides through payment options including Braysheet tokens',
    icon: Coins,
    color: '#cfe7c1',
    capabilities: [
      'Braysheet token guidance',
      'Payment method selection',
      'Currency conversion',
      'Invoice downloads',
      'Payment troubleshooting'
    ],
    isActive: true
  },
  {
    id: 'community-coordinator',
    name: 'Community Coordinator',
    nameHe: 'רכז קהילה',
    description: 'Connects VOP community members and facilitates group orders',
    icon: Users,
    color: '#478c0b',
    capabilities: [
      'Group order coordination',
      'Community announcements',
      'Event notifications',
      'Vendor spotlights',
      'Special offers alerts'
    ],
    isActive: true
  }
];

// Agent response templates
export const AGENT_RESPONSES = {
  'vendor-support': {
    greeting: {
      en: "Hello! I'm here to help you manage your store. What can I assist you with today?",
      he: "שלום! אני כאן לעזור לך לנהל את החנות שלך. במה אוכל לסייע היום?"
    },
    capabilities: {
      onboarding: "I can guide you through setting up your store, adding products, and configuring payment methods.",
      products: "Need help with product listings? I can assist with descriptions, pricing, and image optimization.",
      sales: "Let me show you your sales analytics and help identify top-performing products.",
      invoices: "I can help you generate and download invoices for your orders."
    }
  },
  'customer-service': {
    greeting: {
      en: "Welcome to KFAR Marketplace! How can I help you today?",
      he: "ברוכים הבאים למרקט KFAR! איך אוכל לעזור לכם היום?"
    },
    capabilities: {
      orders: "I can help you track your order, check delivery status, or assist with returns.",
      products: "Looking for something specific? I can help you find products that meet your needs.",
      payment: "Having trouble with payment? I can guide you through our payment options.",
      support: "For urgent matters, I can connect you with a human support agent."
    }
  },
  'order-tracker': {
    greeting: {
      en: "Track your order in real-time! Enter your order number or scan the QR code.",
      he: "עקבו אחר ההזמנה שלכם בזמן אמת! הזינו מספר הזמנה או סרקו את קוד ה-QR."
    },
    statuses: {
      pending: "Your order is being processed by the vendor",
      confirmed: "Order confirmed! The vendor is preparing your items",
      ready: "Your order is ready for pickup/delivery",
      delivered: "Order delivered successfully!"
    }
  },
  'product-advisor': {
    greeting: {
      en: "Let me help you find the perfect products for your needs!",
      he: "תנו לי לעזור לכם למצוא את המוצרים המושלמים לצרכים שלכם!"
    },
    recommendations: {
      vegan: "Based on your preferences, here are VOP-certified vegan options",
      kosher: "These products meet kosher dietary requirements",
      local: "Support local VOP vendors with these community favorites",
      budget: "Great value products within your budget"
    }
  }
};

// Agent action handlers
export class AgentActionHandler {
  static async processVendorSupport(action: string, data: any) {
    switch (action) {
      case 'generate_invoice':
        return { action: 'redirect', url: '/vendor/pos' };
      case 'view_analytics':
        return { action: 'redirect', url: '/vendor/dashboard' };
      case 'add_product':
        return { action: 'redirect', url: '/vendor/onboarding' };
      case 'manage_orders':
        return { action: 'redirect', url: '/vendor/orders' };
      default:
        return { action: 'message', content: AGENT_RESPONSES['vendor-support'].greeting };
    }
  }

  static async processCustomerService(action: string, data: any) {
    switch (action) {
      case 'track_order':
        return { action: 'show_tracking', orderId: data.orderId };
      case 'contact_vendor':
        return { action: 'whatsapp', phone: data.vendorPhone };
      case 'report_issue':
        return { action: 'form', type: 'support_ticket' };
      case 'find_product':
        return { action: 'search', query: data.query };
      default:
        return { action: 'message', content: AGENT_RESPONSES['customer-service'].greeting };
    }
  }

  static async processOrderTracking(orderId: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        return {
          action: 'display_status',
          data: { orderId, status: 'not_found' },
          message: `Order ${orderId} could not be found. Please check the order number and try again.`
        };
      }
      const order = await res.json();
      const status = order.status || 'pending';
      const statusKey = status as keyof typeof AGENT_RESPONSES['order-tracker']['statuses'];
      const statusMessage = AGENT_RESPONSES['order-tracker'].statuses[statusKey]
        || `Order status: ${status}`;

      return {
        action: 'display_status',
        data: {
          orderId: order.id || orderId,
          status,
          vendor: order.vendor_name || order.vendorName || 'Unknown vendor',
          estimatedDelivery: order.estimated_delivery || order.estimatedDelivery || null,
          items: order.items?.length ?? order.item_count ?? 0,
          total: order.total ?? order.total_amount ?? 0
        },
        message: statusMessage
      };
    } catch {
      return {
        action: 'display_status',
        data: { orderId, status: 'error' },
        message: `Unable to retrieve order ${orderId}. Please try again later.`
      };
    }
  }

  static async getProductRecommendations(preferences: any) {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      const allProducts: Array<{ id: string; name: string; price: number; category?: string; tags?: string[]; vegan?: boolean; isVegan?: boolean; vendorId?: string; vendorName?: string; image?: string }> = data.products || data || [];

      let filtered = allProducts;
      if (preferences) {
        const { category, vendorId, maxPrice, query } = preferences;
        if (category) {
          filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        }
        if (vendorId) {
          filtered = filtered.filter(p => p.vendorId === vendorId);
        }
        if (maxPrice) {
          filtered = filtered.filter(p => p.price <= maxPrice);
        }
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
          );
        }
      }

      const recommended = (filtered.length > 0 ? filtered : allProducts).slice(0, 3);

      return {
        action: 'show_products',
        products: recommended.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          vopCertified: p.vegan ?? p.isVegan ?? true,
          vendorName: p.vendorName,
          image: p.image
        })),
        message: AGENT_RESPONSES['product-advisor'].recommendations.vegan
      };
    } catch {
      // Fallback: import directly from the static data layer
      const { getAllProducts } = await import('@/lib/data/wordpress-style-data-layer');
      const allProducts = getAllProducts();
      const recommended = allProducts.slice(0, 3);

      return {
        action: 'show_products',
        products: recommended.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          vopCertified: p.vegan ?? p.isVegan ?? true,
          vendorName: p.vendorName,
          image: p.image
        })),
        message: AGENT_RESPONSES['product-advisor'].recommendations.vegan
      };
    }
  }
}

// Quick action buttons for each agent
export const AGENT_QUICK_ACTIONS: Record<string, { label: string; icon: LucideIcon; action: string }[]> = {
  'vendor-support': [
    { label: 'Generate Invoice', icon: FileText, action: 'generate_invoice' },
    { label: 'View Analytics', icon: TrendingUp, action: 'view_analytics' },
    { label: 'Add Product', icon: Plus, action: 'add_product' },
    { label: 'Manage Orders', icon: Package, action: 'manage_orders' }
  ],
  'customer-service': [
    { label: 'Track Order', icon: Truck, action: 'track_order' },
    { label: 'Contact Vendor', icon: MessageCircle, action: 'contact_vendor' },
    { label: 'Report Issue', icon: AlertCircle, action: 'report_issue' },
    { label: 'Find Product', icon: Search, action: 'find_product' }
  ],
  'order-tracker': [
    { label: 'Enter Order #', icon: Hash, action: 'enter_order' },
    { label: 'Scan QR Code', icon: QrCode, action: 'scan_qr' },
    { label: 'Recent Orders', icon: History, action: 'recent_orders' },
    { label: 'Delivery Map', icon: Map, action: 'delivery_map' }
  ],
  'product-advisor': [
    { label: 'Vegan Only', icon: Leaf, action: 'filter_vegan' },
    { label: 'Kosher', icon: CheckCircle, action: 'filter_kosher' },
    { label: 'Local Vendors', icon: MapPin, action: 'filter_local' },
    { label: 'On Sale', icon: Tag, action: 'filter_sale' }
  ]
};