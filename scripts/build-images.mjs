#!/usr/bin/env node
import { readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, parse, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const sourceDir = join(projectRoot, 'assets', 'images');
const outputDir = join(sourceDir, 'optimized');

const WIDTHS = [800, 1600];
const FORMATS = [
  { ext: 'avif', options: { quality: 55, effort: 4 } },
  { ext: 'webp', options: { quality: 78, effort: 4 } },
  { ext: 'jpg', options: { quality: 82, mozjpeg: true, progressive: true } }
];

async function fileMtime(path) {
  try {
    const s = await stat(path);
    return s.mtimeMs;
  } catch {
    return null;
  }
}

async function variantNeedsRebuild(sourcePath, outputPath) {
  const sourceMtime = await fileMtime(sourcePath);
  const outputMtime = await fileMtime(outputPath);
  if (outputMtime === null) return true;
  if (sourceMtime === null) return false;
  return sourceMtime > outputMtime;
}

async function processImage(filename) {
  const sourcePath = join(sourceDir, filename);
  const { name } = parse(filename);

  const tasks = [];
  for (const width of WIDTHS) {
    for (const format of FORMATS) {
      const outName = `${name}-${width}.${format.ext}`;
      const outPath = join(outputDir, outName);
      if (!(await variantNeedsRebuild(sourcePath, outPath))) {
        tasks.push({ outName, skipped: true });
        continue;
      }
      const pipeline = sharp(sourcePath).resize({
        width,
        withoutEnlargement: true,
        fit: 'inside'
      });
      const writer = format.ext === 'avif'
        ? pipeline.avif(format.options)
        : format.ext === 'webp'
          ? pipeline.webp(format.options)
          : pipeline.jpeg(format.options);
      await writer.toFile(outPath);
      tasks.push({ outName, skipped: false });
    }
  }
  return tasks;
}

async function main() {
  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(sourceDir);
  const sources = entries
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();

  if (sources.length === 0) {
    console.log('No source JPGs found in assets/images/.');
    return;
  }

  console.log(`Optimizing ${sources.length} source image(s) → ${relative(projectRoot, outputDir)}/`);

  let built = 0;
  let skipped = 0;
  for (const filename of sources) {
    const results = await processImage(filename);
    const wrote = results.filter((r) => !r.skipped).length;
    const skip = results.filter((r) => r.skipped).length;
    built += wrote;
    skipped += skip;
    if (wrote === 0) {
      console.log(`  ${filename} — up to date (${skip} variant${skip === 1 ? '' : 's'})`);
    } else {
      console.log(`  ${filename} — wrote ${wrote}, skipped ${skip}`);
    }
  }

  console.log(`Done. ${built} written, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
