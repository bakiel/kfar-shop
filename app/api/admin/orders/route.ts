import { NextRequest, NextResponse } from 'next/server';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import { db, isDbAvailable } from '@/lib/db/postgres-client';

// Mock orders -- used as fallback when DB is unavailable
const mockOrders = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD-001',
    customer: { name: 'Sarah Cohen', email: 'sarah@example.com', phone: '+972-50-123-4567' },
    vendorId: 'teva-deli',
    vendorName: 'Teva Deli',
    items: [
      { productId: 'teva-deli-1', name: 'Vegan Schnitzel', quantity: 2, price: 35 },
      { productId: 'teva-deli-5', name: 'Herb Tofu Block', quantity: 1, price: 28 },
    ],
    subtotal: 98,
    delivery: 15,
    total: 113,
    status: 'processing',
    paymentMethod: 'credit_card',
    deliveryMethod: 'delivery',
    address: '12 HaPalmach St, Dimona',
    notes: '',
    createdAt: '2025-02-08T10:30:00Z',
    updatedAt: '2025-02-08T10:30:00Z',
  },
  {
    id: 'ORD-002',
    orderNumber: 'ORD-002',
    customer: { name: 'David Levi', email: 'david@example.com', phone: '+972-50-234-5678' },
    vendorId: 'queens-cuisine',
    vendorName: "Queen's Cuisine",
    items: [
      { productId: 'queens-cuisine-1', name: 'Seitan Steak', quantity: 2, price: 45 },
    ],
    subtotal: 90,
    delivery: 0,
    total: 90,
    status: 'shipped',
    paymentMethod: 'braysheet',
    deliveryMethod: 'pickup',
    address: '',
    notes: 'Will pick up after 5pm',
    createdAt: '2025-02-07T14:20:00Z',
    updatedAt: '2025-02-07T16:00:00Z',
  },
  {
    id: 'ORD-003',
    orderNumber: 'ORD-003',
    customer: { name: 'Miriam Ben', email: 'miriam@example.com', phone: '+972-50-345-6789' },
    vendorId: 'gahn-delight',
    vendorName: 'Gahn Delight',
    items: [
      { productId: 'gahn-delight-1', name: 'Chocolate Tahini Ice Cream', quantity: 3, price: 18 },
      { productId: 'gahn-delight-2', name: 'Mango Sorbet', quantity: 2, price: 16 },
    ],
    subtotal: 86,
    delivery: 15,
    total: 101,
    status: 'delivered',
    paymentMethod: 'credit_card',
    deliveryMethod: 'delivery',
    address: '8 Derech HaShalom, Dimona',
    notes: 'Keep frozen please',
    createdAt: '2025-02-07T09:15:00Z',
    updatedAt: '2025-02-07T13:00:00Z',
  },
  {
    id: 'ORD-004',
    orderNumber: 'ORD-004',
    customer: { name: 'Yosef Katz', email: 'yosef@example.com', phone: '+972-50-456-7890' },
    vendorId: 'people-store',
    vendorName: "People's Store",
    items: [
      { productId: 'people-store-1', name: 'Organic Quinoa 1kg', quantity: 1, price: 35 },
    ],
    subtotal: 35,
    delivery: 0,
    total: 35,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    deliveryMethod: 'pickup',
    address: '',
    notes: '',
    createdAt: '2025-02-06T18:45:00Z',
    updatedAt: '2025-02-06T18:45:00Z',
  },
  {
    id: 'ORD-005',
    orderNumber: 'ORD-005',
    customer: { name: 'Rachel Green', email: 'rachel@example.com', phone: '+972-50-567-8901' },
    vendorId: 'garden-of-light',
    vendorName: 'Garden of Light',
    items: [
      { productId: 'garden-of-light-1', name: 'Cashew Cream Cheese', quantity: 2, price: 32 },
      { productId: 'garden-of-light-2', name: 'Herb Spread', quantity: 2, price: 28 },
    ],
    subtotal: 120,
    delivery: 15,
    total: 135,
    status: 'processing',
    paymentMethod: 'credit_card',
    deliveryMethod: 'delivery',
    address: '22 Ben Gurion Blvd, Dimona',
    notes: 'Leave at door',
    createdAt: '2025-02-06T11:00:00Z',
    updatedAt: '2025-02-06T11:30:00Z',
  },
  {
    id: 'ORD-006',
    orderNumber: 'ORD-006',
    customer: { name: 'Avi Goldstein', email: 'avi@example.com', phone: '+972-50-678-9012' },
    vendorId: 'teva-deli',
    vendorName: 'Teva Deli',
    items: [
      { productId: 'teva-deli-3', name: 'Shawarma Strips', quantity: 3, price: 42 },
    ],
    subtotal: 126,
    delivery: 15,
    total: 141,
    status: 'cancelled',
    paymentMethod: 'credit_card',
    deliveryMethod: 'delivery',
    address: '5 Herzl St, Dimona',
    notes: 'Customer requested cancellation',
    createdAt: '2025-02-05T16:20:00Z',
    updatedAt: '2025-02-05T17:00:00Z',
  },
  {
    id: 'ORD-007',
    orderNumber: 'ORD-007',
    customer: { name: 'Noa Shapira', email: 'noa@example.com', phone: '+972-50-789-0123' },
    vendorId: 'vop-shop',
    vendorName: 'Village of Peace Shop',
    items: [
      { productId: 'vop-shop-1', name: 'VoP Heritage T-Shirt', quantity: 2, price: 89 },
      { productId: 'vop-shop-3', name: 'Community Mug', quantity: 1, price: 45 },
    ],
    subtotal: 223,
    delivery: 20,
    total: 243,
    status: 'processing',
    paymentMethod: 'credit_card',
    deliveryMethod: 'delivery',
    address: '15 HaNegev St, Beer Sheva',
    notes: '',
    createdAt: '2025-02-08T08:00:00Z',
    updatedAt: '2025-02-08T08:15:00Z',
  },
];

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Try DB first
    const dbUp = await isDbAvailable();
    let orders: any[] = [];

    if (dbUp) {
      try {
        const filters: any = {};
        if (status && status !== 'all') filters.status = status;
        if (vendorId) filters.vendorId = vendorId;
        const dbOrders = await db.orders.findAll(filters);
        if (dbOrders.length > 0) {
          orders = dbOrders;
        }
      } catch {
        // Fall through to mock data
      }
    }

    // Use mock data if DB returned nothing
    if (orders.length === 0) {
      orders = [...mockOrders];
    }

    // Apply filters on mock data (DB filters are already applied above)
    if (orders === mockOrders || orders[0]?.id?.startsWith('ORD-')) {
      if (status && status !== 'all') {
        orders = orders.filter((o) => o.status === status);
      }
      if (vendorId) {
        orders = orders.filter((o) => o.vendorId === vendorId);
      }
    }

    // Paginate
    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);

    // Summary counts (over entire dataset, not just page)
    const allOrders = orders;
    const summary = {
      total: allOrders.length,
      pending: allOrders.filter((o) => o.status === 'pending').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipped: allOrders.filter((o) => o.status === 'shipped').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    };

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Try DB update first
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const updated = await db.orders.updateStatus(orderId, status);
        if (updated) {
          return NextResponse.json({
            success: true,
            order: updated,
            message: `Order ${orderId} updated to ${status}`,
          });
        }
      } catch {
        // Fall through to mock update
      }
    }

    // Mock update -- find in mock array and "update"
    const orderIndex = mockOrders.findIndex(
      (o) => o.id === orderId || o.orderNumber === orderId
    );

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: `Order ${orderId} not found` },
        { status: 404 }
      );
    }

    const previousStatus = mockOrders[orderIndex].status;
    mockOrders[orderIndex].status = status;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();
    if (notes) {
      mockOrders[orderIndex].notes = notes;
    }

    return NextResponse.json({
      success: true,
      order: mockOrders[orderIndex],
      message: `Order ${orderId} updated from ${previousStatus} to ${status}`,
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
