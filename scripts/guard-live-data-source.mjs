#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = process.cwd();
const currentFile = path.relative(rootDir, fileURLToPath(import.meta.url));
const scanRoots = ['app', 'components', 'lib', 'scripts'];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const ignoredDirectoryNames = new Set(['.git', '.next', '.deploy', 'node_modules']);
const ignoredPathPrefixes = [
  'components/landing/_archived/',
  'lib/data/',
];

const blockedImports = [
  {
    label: 'old wordpress-style data layer',
    pattern: /\b(?:import\s+[^;]*?\s+from\s*|import\s*\(\s*|require\s*\(\s*)['"][^'"]*wordpress-style-data-layer[^'"]*['"]/g,
  },
  {
    label: 'static complete catalog data',
    pattern: /\b(?:import\s+[^;]*?\s+from\s*|import\s*\(\s*|require\s*\(\s*)['"][^'"]*complete-catalog[^'"]*['"]/g,
  },
];

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function shouldIgnore(relativePath) {
  const posixPath = toPosixPath(relativePath);

  if (posixPath === currentFile || ignoredPathPrefixes.some(prefix => posixPath.startsWith(prefix))) {
    return true;
  }

  return posixPath
    .split('/')
    .some(segment => ignoredDirectoryNames.has(segment));
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(rootDir, absolutePath);

    if (shouldIgnore(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split('\n').length;
}

async function main() {
  const files = [];

  for (const scanRoot of scanRoots) {
    files.push(...await collectSourceFiles(path.join(rootDir, scanRoot)));
  }

  const failures = [];

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8');
    const relativePath = toPosixPath(path.relative(rootDir, filePath));

    for (const blockedImport of blockedImports) {
      blockedImport.pattern.lastIndex = 0;
      let match;

      while ((match = blockedImport.pattern.exec(source)) !== null) {
        failures.push({
          file: relativePath,
          line: lineNumberForIndex(source, match.index),
          label: blockedImport.label,
          match: match[0],
        });
      }
    }
  }

  if (failures.length > 0) {
    console.error('Live data source guard failed. Runtime code must use DB-backed feeds, not static catalogs.');
    for (const failure of failures) {
      console.error(`- ${failure.file}:${failure.line} imports ${failure.label}`);
      console.error(`  ${failure.match}`);
    }
    process.exit(1);
  }

  console.log(`Live data source guard passed (${files.length} source files scanned).`);
}

main().catch(error => {
  console.error('Live data source guard failed unexpectedly:', error);
  process.exit(1);
});
