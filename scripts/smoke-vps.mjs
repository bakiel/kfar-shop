#!/usr/bin/env node

const baseUrl = process.env.SMOKE_BASE_URL || process.argv[2] || 'https://kfarapp.com';
const timeoutMs = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '20000', 10);
const retries = Number.parseInt(process.env.SMOKE_RETRIES || '6', 10);
const retryDelayMs = Number.parseInt(process.env.SMOKE_RETRY_DELAY_MS || '5000', 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function fetchWithTimeout(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(toUrl(path), {
      redirect: 'follow',
      ...init,
      headers: {
        'Cache-Control': 'no-cache',
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function requireOk(path, init = {}) {
  const response = await fetchWithTimeout(path, init);
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  return response;
}

async function check(name, fn, attempts = retries) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await fn();
      console.log(`[smoke] ok ${name}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.warn(`[smoke] retry ${name} (${attempt}/${attempts}):`, error.message || error);
        await sleep(retryDelayMs);
      }
    }
  }

  console.error(`[smoke] fail ${name}:`, lastError?.message || lastError);
  process.exitCode = 1;
}

await check('health', async () => {
  const response = await requireOk('/api/health');
  const health = await response.json();
  if (health.status !== 'ok' || health.db !== true) {
    throw new Error(`health status=${health.status} db=${health.db}`);
  }
});

await check('products feed', async () => {
  const response = await requireOk('/api/products-db');
  const data = await response.json();
  if (!data.success || !Number.isFinite(data.count) || data.count < 1) {
    throw new Error(`invalid product feed response count=${data.count}`);
  }
  if (data.source !== 'database' || data.stale === true) {
    throw new Error(`product feed is not live database source=${data.source} stale=${data.stale}`);
  }
  console.log(`[smoke] products count=${data.count} source=${data.source || 'unknown'}`);
});

await check('search feed', async () => {
  const response = await requireOk('/api/search?q=teva&limit=5');
  const data = await response.json();
  if (!data.success || data.source !== 'database' || !Number.isFinite(data.total)) {
    throw new Error(`invalid search feed source=${data.source} total=${data.total}`);
  }
});

await check('vendor feed', async () => {
  const response = await requireOk('/api/vendors');
  const data = await response.json();
  if (!data.success || data.source !== 'database' || data.stale === true || !Array.isArray(data.vendors) || data.vendors.length < 1) {
    throw new Error(`invalid vendor feed source=${data.source} stale=${data.stale} count=${data.vendors?.length || 0}`);
  }
  console.log(`[smoke] vendors count=${data.vendors.length} source=${data.source || 'unknown'}`);
});

let marketplaceHtml = '';
await check('marketplace html', async () => {
  const response = await requireOk('/marketplace');
  marketplaceHtml = await response.text();
  if (!marketplaceHtml.includes('/_next/static/')) {
    throw new Error('marketplace HTML did not include Next static assets');
  }
});

await check('static assets', async () => {
  const assets = [...new Set(
    [...marketplaceHtml.matchAll(/\/_next\/static\/(?:css|chunks)\/[^"'\s<]+/g)]
      .map((match) => match[0])
  )];

  if (assets.length < 5) {
    throw new Error(`expected several static assets, found ${assets.length}`);
  }

  for (const asset of assets) {
    const response = await requireOk(asset, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('javascript') && !contentType.includes('css')) {
      throw new Error(`${asset} returned unexpected content-type ${contentType}`);
    }
  }
  console.log(`[smoke] static asset count=${assets.length}`);
});

await check('loading logo', async () => {
  const response = await requireOk('/images/logos/kfar_icon_leaf_gold.png', { method: 'HEAD' });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`unexpected content-type ${contentType}`);
  }
});

await check('critical pages', async () => {
  for (const path of ['/cart', '/checkout', '/product/teva_deli_td043']) {
    await requireOk(path);
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`[smoke] passed ${baseUrl}`);
