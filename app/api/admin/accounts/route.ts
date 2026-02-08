import { NextRequest, NextResponse } from 'next/server';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import { db, isDbAvailable } from '@/lib/db/postgres-client';

// Mock customer data -- used when DB is unavailable
const mockCustomers = [
  {
    id: 'cust-001',
    name: 'Sarah Cohen',
    email: 'sarah@example.com',
    phone: '+972-50-123-4567',
    address: '12 HaPalmach St, Dimona',
    totalOrders: 8,
    totalSpent: 1245,
    loyaltyPoints: 620,
    memberSince: '2024-06-15',
    lastOrder: '2025-02-08',
    status: 'active',
  },
  {
    id: 'cust-002',
    name: 'David Levi',
    email: 'david@example.com',
    phone: '+972-50-234-5678',
    address: '45 HaAtsma\'ut Blvd, Dimona',
    totalOrders: 12,
    totalSpent: 2180,
    loyaltyPoints: 1090,
    memberSince: '2024-03-10',
    lastOrder: '2025-02-07',
    status: 'active',
  },
  {
    id: 'cust-003',
    name: 'Miriam Ben',
    email: 'miriam@example.com',
    phone: '+972-50-345-6789',
    address: '8 Derech HaShalom, Dimona',
    totalOrders: 5,
    totalSpent: 680,
    loyaltyPoints: 340,
    memberSince: '2024-09-22',
    lastOrder: '2025-02-07',
    status: 'active',
  },
  {
    id: 'cust-004',
    name: 'Yosef Katz',
    email: 'yosef@example.com',
    phone: '+972-50-456-7890',
    address: '31 HaNegev St, Dimona',
    totalOrders: 3,
    totalSpent: 295,
    loyaltyPoints: 145,
    memberSince: '2024-11-05',
    lastOrder: '2025-02-06',
    status: 'active',
  },
  {
    id: 'cust-005',
    name: 'Rachel Green',
    email: 'rachel@example.com',
    phone: '+972-50-567-8901',
    address: '22 Ben Gurion Blvd, Dimona',
    totalOrders: 15,
    totalSpent: 3420,
    loyaltyPoints: 1710,
    memberSince: '2024-01-20',
    lastOrder: '2025-02-06',
    status: 'active',
  },
  {
    id: 'cust-006',
    name: 'Avi Goldstein',
    email: 'avi@example.com',
    phone: '+972-50-678-9012',
    address: '5 Herzl St, Dimona',
    totalOrders: 1,
    totalSpent: 141,
    loyaltyPoints: 70,
    memberSince: '2025-01-15',
    lastOrder: '2025-02-05',
    status: 'active',
  },
  {
    id: 'cust-007',
    name: 'Noa Shapira',
    email: 'noa@example.com',
    phone: '+972-50-789-0123',
    address: '15 HaNegev St, Beer Sheva',
    totalOrders: 2,
    totalSpent: 412,
    loyaltyPoints: 205,
    memberSince: '2025-01-28',
    lastOrder: '2025-02-08',
    status: 'active',
  },
  {
    id: 'cust-008',
    name: 'Tamar Rosenberg',
    email: 'tamar@example.com',
    phone: '+972-50-890-1234',
    address: '19 Kakal St, Dimona',
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 50,
    memberSince: '2025-02-01',
    lastOrder: null,
    status: 'inactive',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'customers', 'vendors', or null (both)
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');

    // --- Customers ---
    let customers: any[] = [];

    if (!type || type === 'customers') {
      const dbUp = await isDbAvailable();
      if (dbUp) {
        try {
          const dbCustomers = await db.customers.findAll();
          if (dbCustomers.length > 0) {
            customers = dbCustomers;
          }
        } catch {
          // Fall through to mock data
        }
      }

      if (customers.length === 0) {
        customers = [...mockCustomers];
      }

      // Filter customers
      if (search) {
        customers = customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.phone?.includes(search)
        );
      }
      if (status && status !== 'all') {
        customers = customers.filter((c) => c.status === status);
      }
    }

    // --- Vendors ---
    let vendors: any[] = [];

    if (!type || type === 'vendors') {
      const vendorArray = Object.values(vendorStores);

      vendors = vendorArray.map((v) => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        description: v.description,
        logo: v.logo,
        productCount: v.products?.length || 0,
        categories: v.categories,
        established: v.metadata?.established,
        location: v.metadata?.location,
        specialty: v.metadata?.specialty,
        certifications: v.metadata?.certifications,
        totalRevenue: Math.floor(Math.random() * 8000) + 2000,
        averageRating: parseFloat((4 + Math.random()).toFixed(1)),
        totalOrders: Math.floor(Math.random() * 50) + 10,
        status: 'active',
      }));

      if (search) {
        vendors = vendors.filter(
          (v) =>
            v.name?.toLowerCase().includes(search) ||
            v.specialty?.toLowerCase().includes(search)
        );
      }
    }

    const response: any = {};

    if (!type || type === 'customers') {
      response.customers = customers;
      response.customerCount = customers.length;
    }
    if (!type || type === 'vendors') {
      response.vendors = vendors;
      response.vendorCount = vendors.length;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Accounts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
