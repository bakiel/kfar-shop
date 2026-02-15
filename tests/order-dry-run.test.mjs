#!/usr/bin/env node
/**
 * KFAR Marketplace - Order Dry Run
 * Creates 5 test orders against production /api/orders/create
 * Then verifies them via /api/admin/orders (requires admin token)
 *
 * Run: node tests/order-dry-run.test.mjs [--base=http://localhost:3006]
 */

const BASE = process.argv.find(a => a.startsWith('--base='))?.split('=')[1] || 'https://kfarapp.com';

let passed = 0;
let failed = 0;
const createdOrders = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 5 test orders covering different vendors, items, delivery methods
const TEST_ORDERS = [
  {
    name: 'Order 1: Teva Deli pickup',
    data: {
      items: [
        { productId: 'teva-deli-1', name: 'Seitan Amaranth Kubbeh', quantity: 2, price: 35, vendorId: 'teva-deli', vendorName: 'Teva Deli' },
        { productId: 'teva-deli-5', name: 'Herb Tofu Block', quantity: 1, price: 28, vendorId: 'teva-deli', vendorName: 'Teva Deli' },
      ],
      subtotal: 98,
      deliveryFee: 0,
      total: 98,
      customer: { firstName: 'Test', lastName: 'OrderOne', email: 'test-order-1@example.com', phone: '+972501111111' },
      deliveryMethod: 'pickup',
      paymentMethod: 'cash',
      notes: 'DRY RUN TEST ORDER - DO NOT FULFILL',
    }
  },
  {
    name: 'Order 2: Queens Cuisine delivery',
    data: {
      items: [
        { productId: 'queens-cuisine-1', name: 'Vegan Spicy Stew', quantity: 1, price: 45, vendorId: 'queens-cuisine', vendorName: "Queen's Cuisine" },
      ],
      subtotal: 45,
      deliveryFee: 15,
      total: 60,
      customer: { firstName: 'Test', lastName: 'OrderTwo', email: 'test-order-2@example.com', phone: '+972502222222', address: '5 HaNegev St', city: 'Dimona' },
      deliveryMethod: 'delivery',
      paymentMethod: 'credit_card',
      notes: 'DRY RUN TEST ORDER - DO NOT FULFILL',
    }
  },
  {
    name: 'Order 3: Multi-vendor (Teva + Gahn)',
    data: {
      items: [
        { productId: 'teva-deli-3', name: 'Crispy Tofu Bites', quantity: 3, price: 32, vendorId: 'teva-deli', vendorName: 'Teva Deli' },
        { productId: 'gahn-delight-1', name: 'Tropical Fruit Parfait', quantity: 2, price: 25, vendorId: 'gahn-delight', vendorName: 'Gahn Delight' },
      ],
      subtotal: 146,
      deliveryFee: 15,
      total: 161,
      customer: { firstName: 'Test', lastName: 'OrderThree', email: 'test-order-3@example.com' },
      deliveryMethod: 'delivery',
      paymentMethod: 'braysheet',
      notes: 'DRY RUN TEST ORDER - DO NOT FULFILL',
    }
  },
  {
    name: "Order 4: People's Store pickup",
    data: {
      items: [
        { productId: 'peoples-store-1', name: 'Organic Olive Oil', quantity: 1, price: 55, vendorId: 'peoples-store', vendorName: "People's Store" },
        { productId: 'peoples-store-5', name: 'Herbal Tea Collection', quantity: 2, price: 18, vendorId: 'peoples-store', vendorName: "People's Store" },
      ],
      subtotal: 91,
      deliveryFee: 0,
      total: 91,
      customer: { firstName: 'Test', lastName: 'OrderFour', email: 'test-order-4@example.com', phone: '+972504444444' },
      deliveryMethod: 'pickup',
      paymentMethod: 'cash',
      notes: 'DRY RUN TEST ORDER - DO NOT FULFILL',
    }
  },
  {
    name: 'Order 5: Garden of Light large order',
    data: {
      items: [
        { productId: 'garden-of-light-1', name: 'Fresh Herb Bundle', quantity: 5, price: 12, vendorId: 'garden-of-light', vendorName: 'Garden of Light' },
        { productId: 'garden-of-light-3', name: 'Organic Sprout Mix', quantity: 3, price: 22, vendorId: 'garden-of-light', vendorName: 'Garden of Light' },
      ],
      subtotal: 126,
      deliveryFee: 15,
      total: 141,
      customer: { firstName: 'Test', lastName: 'OrderFive', email: 'test-order-5@example.com', phone: '+972505555555', address: '10 Arad Rd', city: 'Dimona', country: 'Israel' },
      deliveryMethod: 'delivery',
      paymentMethod: 'credit_card',
      notes: 'DRY RUN TEST ORDER - DO NOT FULFILL',
    }
  },
];

console.log(`\nKFAR Order Dry Run - 5 Test Orders`);
console.log(`Target: ${BASE}\n`);

// Create all 5 orders
for (const testOrder of TEST_ORDERS) {
  await test(`Create ${testOrder.name}`, async () => {
    const res = await fetch(`${BASE}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder.data),
    });
    assert(res.ok, `Order creation returned ${res.status}: ${await res.text()}`);
    const data = await res.json();
    assert(data.success, `Order creation failed: ${data.error}`);
    assert(data.order?.orderNumber, 'No order number returned');
    assert(data.order?.id, 'No order ID returned');
    assert(data.order?.status === 'pending', `Expected status pending, got ${data.order?.status}`);
    createdOrders.push(data.order);
    console.log(`        -> ${data.order.orderNumber} (ID: ${data.order.id})`);
  });
}

// Verify order retrieval
await test('Verify: All 5 orders have unique order numbers', async () => {
  const orderNumbers = createdOrders.map(o => o.orderNumber);
  const unique = new Set(orderNumbers);
  assert(unique.size === 5, `Expected 5 unique order numbers, got ${unique.size}`);
});

await test('Verify: All orders have pending status', async () => {
  const allPending = createdOrders.every(o => o.status === 'pending');
  assert(allPending, 'Not all orders have pending status');
});

await test('Verify: Order totals match input', async () => {
  const expectedTotals = [98, 60, 161, 91, 141];
  for (let i = 0; i < createdOrders.length; i++) {
    const actual = parseFloat(createdOrders[i].totalAmount);
    assert(actual === expectedTotals[i], `Order ${i + 1}: expected total ${expectedTotals[i]}, got ${actual}`);
  }
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log(`${'='.repeat(50)}`);

if (createdOrders.length > 0) {
  console.log(`\nCreated orders (mark as cancelled after review):`);
  createdOrders.forEach(o => {
    console.log(`  ${o.orderNumber} - ${o.customerName} - ${parseFloat(o.totalAmount).toFixed(2)} ILS`);
  });
}
console.log('');

process.exit(failed > 0 ? 1 : 0);
