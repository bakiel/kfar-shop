import { promises as fs } from 'fs';
import path from 'path';
import pg from 'pg';

const baseUrl = process.env.KFAR_AUDIT_BASE_URL || 'http://localhost:3000';
const outDir = path.join(process.cwd(), 'project-reports');
const outFile = path.join(outDir, `image-audit-${new Date().toISOString().slice(0, 10)}.csv`);
const manifestPath = path.join(process.cwd(), 'lib', 'utils', 'image-manifest.json');
const fallbackImage = '/images/placeholder-product.jpg';
const legacyCorrections: Record<string, string> = {
  '/images/gahn-delight/gahn_delight_official_logo_master_brand_vegan_ice_cream.jpg': '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
  '/images/people-store/people_store_official_logo_master_brand_bulk_foods_grocery.jpg': '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',
  '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_vegan_gourmet_catering.jpg': '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
  '/images/vop-shop/vop_shop_official_logo_master_brand_community_marketplace.jpg': '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
};
const { Pool } = pg;
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'kfar_marketplace',
  user: process.env.POSTGRES_USER || 'kfar',
  password: process.env.POSTGRES_PASSWORD || '',
  connectionTimeoutMillis: 2_000,
  statement_timeout: 8_000,
  query_timeout: 8_000,
});

type AuditRow = {
  tableName: string;
  recordId: string;
  fieldName: string;
  originalSrc: string;
  resolvedSrc: string;
  status: string;
  resolvedByPlaceholder: boolean;
};

let manifest: Record<string, string> = {};

async function loadManifest() {
  const raw = await fs.readFile(manifestPath, 'utf8');
  manifest = JSON.parse(raw);
}

function resolveAuditImagePath(value: string) {
  let cleanPath = value.trim();
  if (!cleanPath) return { src: fallbackImage, placeholder: true };
  if (/^https?:\/\//i.test(cleanPath)) return { src: cleanPath, placeholder: false };
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
  if (cleanPath.startsWith('/uploads/vendor-products/')) return { src: cleanPath, placeholder: false };
  if (legacyCorrections[cleanPath]) return { src: legacyCorrections[cleanPath], placeholder: false };
  const basename = cleanPath.split('/').pop() || cleanPath;
  const src = manifest[cleanPath] || manifest[basename] || manifest[basename.toLowerCase()];
  return src ? { src, placeholder: false } : { src: fallbackImage, placeholder: true };
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
}

async function headStatus(src: string) {
  if (/^https?:\/\//i.test(src)) return 'external';
  try {
    const res = await fetch(new URL(src, baseUrl), { method: 'HEAD' });
    return String(res.status);
  } catch (error) {
    return `error:${(error as Error).message}`;
  }
}

async function addRows(rows: AuditRow[], tableName: string, records: any[], fields: string[]) {
  for (const record of records) {
    for (const fieldName of fields) {
      const values = fieldName.includes('gallery') || fieldName.includes('images')
        ? toStringArray(record[fieldName])
        : [record[fieldName]].filter(Boolean).map(String);
      for (const originalSrc of values) {
        const resolved = resolveAuditImagePath(originalSrc);
        rows.push({
          tableName,
          recordId: String(record.id || record.slug || ''),
          fieldName,
          originalSrc,
          resolvedSrc: resolved.src,
          status: resolved.placeholder ? 'missing-manifest' : await headStatus(resolved.src),
          resolvedByPlaceholder: resolved.placeholder,
        });
      }
    }
  }
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function main() {
  await loadManifest();
  const auditRows: AuditRow[] = [];
  const products = await pool.query('SELECT * FROM products ORDER BY id');
  const vendors = await pool.query('SELECT * FROM vendors ORDER BY id');
  const bundles = await pool.query('SELECT * FROM bundles ORDER BY id').catch(() => ({ rows: [] }));

  await addRows(auditRows, 'products', products.rows, ['primary_image', 'image_url', 'image', 'image_gallery', 'images']);
  await addRows(auditRows, 'vendors', vendors.rows, ['logo_url', 'logo_path', 'banner_url', 'banner_path']);
  await addRows(auditRows, 'bundles', bundles.rows, ['image']);

  await fs.mkdir(outDir, { recursive: true });
  const header = ['table', 'record_id', 'field', 'original_src', 'resolved_src', 'status'];
  const lines = [
    header.join(','),
    ...auditRows.map(row => [
      row.tableName,
      row.recordId,
      row.fieldName,
      row.originalSrc,
      row.resolvedSrc,
      row.status,
    ].map(csvEscape).join(',')),
  ];
  await fs.writeFile(outFile, `${lines.join('\n')}\n`, 'utf8');
  const misses = auditRows.filter(row => row.resolvedByPlaceholder || !['200', 'external'].includes(row.status));
  console.log(`Audited ${auditRows.length} image references. Misses: ${misses.length}. Report: ${outFile}`);
  if (misses.length > 0) process.exitCode = 1;
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  pool.end().catch(() => {});
  process.exit(1);
});
