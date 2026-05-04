#!/usr/bin/env node
//
// Subset and convert TTF web fonts to WOFF2.
//
// Site renders only EN + PT, so the full Unicode coverage shipped in the
// upstream TTFs is wasted bandwidth. This script reads every TTF in
// `assets/fonts/`, subsets it to the Unicode ranges actually rendered
// (Latin, Latin-Ext, common punctuation, currency, symbols), and writes
// WOFF2 to `assets/fonts/optimized/`.
//
// Implementation: Node + `subset-font` (a harfbuzz-wasm wrapper). Picked
// over the Python `fonttools` route because it runs from `npm install`
// alone — no pipx/uv/venv — which is reliable across environments and
// avoids elevated privileges.
//
// Incremental: skips outputs newer than their TTF source (mtime check).

import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, parse, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const sourceDir = join(projectRoot, 'assets', 'fonts');
const outputDir = join(projectRoot, 'assets', 'fonts', 'optimized');

// Latin + Latin-Ext + common punctuation, currency, letterlike symbols.
// Covers all glyphs rendered for EN and PT (including ã ç õ é ê í ó ú à
// and the smart quotes / em-dash / · used in the marquee and copy).
const UNICODE_RANGES = [
  [0x0000, 0x024f], // Basic Latin + Latin-1 Supp + Latin Extended-A/B
  [0x1e00, 0x1eff], // Latin Extended Additional
  [0x2000, 0x206f], // General Punctuation
  [0x20a0, 0x20cf], // Currency Symbols
  [0x2100, 0x2188]  // Letterlike Symbols, Number Forms, Arrows fragment
];

function buildSubsetText() {
  const codepoints = [];
  for (const [start, end] of UNICODE_RANGES) {
    for (let cp = start; cp <= end; cp++) {
      codepoints.push(cp);
    }
  }
  return String.fromCodePoint(...codepoints);
}

async function fileMtime(path) {
  try {
    const s = await stat(path);
    return s.mtimeMs;
  } catch {
    return null;
  }
}

async function needsRebuild(sourcePath, outputPath) {
  const sourceMtime = await fileMtime(sourcePath);
  const outputMtime = await fileMtime(outputPath);
  if (outputMtime === null) return true;
  if (sourceMtime === null) return false;
  return sourceMtime > outputMtime;
}

async function processFont(filename, subsetText) {
  const sourcePath = join(sourceDir, filename);
  const { name } = parse(filename);
  const outName = `${name}.woff2`;
  const outPath = join(outputDir, outName);

  if (!(await needsRebuild(sourcePath, outPath))) {
    return { outName, skipped: true };
  }

  const buffer = await readFile(sourcePath);
  const subset = await subsetFont(buffer, subsetText, { targetFormat: 'woff2' });
  await writeFile(outPath, subset);

  const sourceSize = (await stat(sourcePath)).size;
  const outSize = (await stat(outPath)).size;
  return { outName, skipped: false, sourceSize, outSize };
}

async function main() {
  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(sourceDir);
  const sources = entries.filter((f) => /\.ttf$/i.test(f)).sort();

  if (sources.length === 0) {
    console.log(`No TTFs found in ${relative(projectRoot, sourceDir)}/.`);
    return;
  }

  console.log(`Subsetting ${sources.length} font(s) → ${relative(projectRoot, outputDir)}/`);
  const subsetText = buildSubsetText();

  let built = 0;
  let skipped = 0;
  let totalSource = 0;
  let totalOut = 0;
  for (const filename of sources) {
    const result = await processFont(filename, subsetText);
    if (result.skipped) {
      skipped += 1;
      console.log(`  ${filename} — up to date`);
    } else {
      built += 1;
      totalSource += result.sourceSize;
      totalOut += result.outSize;
      const pct = ((1 - result.outSize / result.sourceSize) * 100).toFixed(1);
      console.log(
        `  ${filename} → ${result.outName} ` +
        `(${(result.sourceSize / 1024).toFixed(1)}KB → ` +
        `${(result.outSize / 1024).toFixed(1)}KB, -${pct}%)`
      );
    }
  }

  console.log(`\nDone. ${built} written, ${skipped} skipped.`);
  if (built > 0) {
    const pct = ((1 - totalOut / totalSource) * 100).toFixed(1);
    console.log(
      `Total: ${(totalSource / 1024).toFixed(1)}KB TTF → ` +
      `${(totalOut / 1024).toFixed(1)}KB WOFF2 (-${pct}%)`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
