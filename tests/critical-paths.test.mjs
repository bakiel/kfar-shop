#!/usr/bin/env node
/**
 * KFAR Marketplace - 10 Critical Path Tests
 * Tests against live production at https://kfarapp.com
 * Run: node tests/critical-paths.test.mjs [--base=http://localhost:3006]
 */

const BASE = process.argv.find(a => a.startsWith('--base='))?.split('=')[1] || 'https://kfarapp.com';

let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ─── Tests ──────────────────────────────────────────────

console.log(`\nKFAR Critical Path Tests`);
console.log(`Target: ${BASE}\n`);

// 1. Homepage loads
await test('1. Homepage returns 200', async () => {
  const res = await fetch(BASE, { redirect: 'follow' });
  assert(res.ok, `Homepage returned ${res.status}`);
  const html = await res.text();
  assert(html.includes('KFAR'), 'Homepage does not contain KFAR branding');
});

// 2. Products API returns products
await test('2. Products API returns products', async () => {
  const res = await fetch(`${BASE}/api/products`);
  assert(res.ok, `Products API returned ${res.status}`);
  const data = await res.json();
  assert(data.products && data.products.length > 0, 'No products returned');
  assert(data.total >= 100, `Expected 100+ products, got ${data.total}`);
});

// 3. Vendors API returns 6 vendors
await test('3. Vendors API returns vendors', async () => {
  const res = await fetch(`${BASE}/api/vendors`);
  assert(res.ok, `Vendors API returned ${res.status}`);
  const data = await res.json();
  assert(data.vendors && data.vendors.length >= 6, `Expected 6+ vendors, got ${data.vendors?.length}`);
});

// 4. Landing page API returns structured data
await test('4. Landing API returns homepage data', async () => {
  const res = await fetch(`${BASE}/api/landing`);
  assert(res.ok, `Landing API returned ${res.status}`);
  const data = await res.json();
  assert(data.featuredProducts || data.vendors || data.promotions, 'Landing data missing expected fields');
});

// 5. Product search works
await test('5. Product search returns results for "tofu"', async () => {
  const res = await fetch(`${BASE}/api/products?search=tofu`);
  assert(res.ok, `Search returned ${res.status}`);
  const data = await res.json();
  assert(data.products && data.products.length > 0, 'No search results for "tofu"');
  const hasTofu = data.products.some(p => p.name.toLowerCase().includes('tofu'));
  assert(hasTofu, 'Search results do not contain tofu products');
});

// 6. Login with invalid credentials returns 401
await test('6. Login rejects invalid credentials (401)', async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@fake.com', password: 'wrongpass' }),
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

// 7. Login with missing fields returns 400
await test('7. Login rejects missing fields (400)', async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com' }),
  });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
});

// 8. Registration with short password returns 400
await test('8. Registration rejects short password (400)', async () => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: '123', name: 'Test' }),
  });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  const data = await res.json();
  assert(data.error.toLowerCase().includes('password'), `Error should mention password: ${data.error}`);
});

// 9. Protected vendor API requires auth
await test('9. Vendor analytics requires authentication', async () => {
  const res = await fetch(`${BASE}/api/vendor/analytics`);
  assert(res.status === 401, `Expected 401 for unauthenticated vendor access, got ${res.status}`);
});

// 10. Admin API requires auth (fixed locally - will pass after deploy)
await test('10. Admin dashboard API requires authentication', async () => {
  const res = await fetch(`${BASE}/api/admin/dashboard`);
  assert(res.status === 401 || res.status === 403, `Expected 401/403 for unauthenticated admin access, got ${res.status}`);
});

// ─── Summary ────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) {
  console.log('Failed tests:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  console.log('');
}

process.exit(failed > 0 ? 1 : 0);
