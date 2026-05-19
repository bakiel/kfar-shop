import { promises as fs } from 'fs';
import path from 'path';

const root = process.cwd();
const imageRoot = path.join(root, 'public', 'images');
const outputPath = path.join(root, 'lib', 'utils', 'image-manifest.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile() || !imageExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [fullPath];
  }));
  return files.flat();
}

function addMapping(manifest: Record<string, string>, key: string, value: string) {
  if (!key) return;
  if (!manifest[key] || value.length < manifest[key].length) {
    manifest[key] = value;
  }
}

async function main() {
  const files = await walk(imageRoot);
  const manifest: Record<string, string> = {};

  for (const file of files) {
    const publicPath = `/${path.relative(path.join(root, 'public'), file).split(path.sep).join('/')}`;
    const basename = path.basename(file);
    addMapping(manifest, basename, publicPath);
    addMapping(manifest, basename.toLowerCase(), publicPath);
    addMapping(manifest, publicPath, publicPath);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${Object.keys(manifest).length} image manifest entries to ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
