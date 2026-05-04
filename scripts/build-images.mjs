#!/usr/bin/env node
import { readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, parse, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const FORMATS = [
  { ext: 'avif', options: { quality: 55, effort: 4 } },
  { ext: 'webp', options: { quality: 78, effort: 4 } },
  { ext: 'jpg', options: { quality: 82, mozjpeg: true, progressive: true } }
];

const SOURCES = [
  {
    label: 'images',
    sourceDir: join(projectRoot, 'assets', 'images'),
    outputDir: join(projectRoot, 'assets', 'images', 'optimized'),
    widths: [800, 1600]
  },
  {
    label: 'posters',
    sourceDir: join(projectRoot, 'assets', 'posters'),
    outputDir: join(projectRoot, 'assets', 'posters', 'optimized'),
    widths: [400, 800]
  },
  {
    label: 'cinema posters',
    sourceDir: join(projectRoot, 'assets', 'cinema', 'posters'),
    outputDir: join(projectRoot, 'assets', 'cinema', 'posters', 'optimized'),
    widths: [400, 800]
  }
];

// Art-directed portrait crops. The hero source ships as a 16:9 landscape
// frame; on a phone in portrait orientation, that landscape file gets
// cropped to fit by `object-cover`, which jams the focal subject against
// the top of the visible area and trims the warm negative space at the
// edges. The 4:5 portrait extract below re-frames the same scene for a
// vertical viewport — same composition the photographer built, recentred
// on the focal subject.
//
// Source `hero-living-room.jpg` is 1280x720. The maximum 4:5 region we
// can take at native resolution is 576x720 (centre-horizontal, full
// height). The 600w variant lands close to that native resolution; the
// 1200w variant is a 2× upscale (sharp's default lanczos kernel) which
// is acceptable for the LCP image on a 3× DPR phone where the raw pixels
// are scaled down again at paint. If a higher-resolution hero source is
// added later, the upscale becomes lossless and these settings still
// apply.
const PORTRAIT_CROPS = [
  {
    sourceFile: join(projectRoot, 'assets', 'images', 'hero-living-room.jpg'),
    outputDir: join(projectRoot, 'assets', 'images', 'optimized'),
    outputStem: 'hero-living-room-portrait',
    extract: { left: 352, top: 0, width: 576, height: 720 },
    widths: [600, 1200]
  }
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

async function processImage(filename, { sourceDir, outputDir, widths }) {
  const sourcePath = join(sourceDir, filename);
  const { name } = parse(filename);

  const tasks = [];
  for (const width of widths) {
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

async function processSource(source) {
  const { sourceDir, outputDir, label } = source;
  if (!existsSync(sourceDir)) {
    console.warn(`Source directory not found, skipping: ${sourceDir}`);
    return { built: 0, skipped: 0 };
  }
  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(sourceDir);
  const sources = entries
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();

  if (sources.length === 0) {
    console.log(`No source JPGs found in ${relative(projectRoot, sourceDir)}/.`);
    return { built: 0, skipped: 0 };
  }

  console.log(`\n[${label}] Optimizing ${sources.length} source image(s) → ${relative(projectRoot, outputDir)}/`);

  let built = 0;
  let skipped = 0;
  for (const filename of sources) {
    const results = await processImage(filename, source);
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

  return { built, skipped };
}

async function processCrop(crop) {
  const { sourceFile, outputDir, outputStem, extract, widths } = crop;
  if (!existsSync(sourceFile)) {
    console.warn(`Crop source not found, skipping: ${sourceFile}`);
    return { built: 0, skipped: 0 };
  }
  await mkdir(outputDir, { recursive: true });

  console.log(
    `\n[crops] ${relative(projectRoot, sourceFile)} → ${outputStem}-{${widths.join(',')}}` +
    ` (extract ${extract.width}x${extract.height} @ ${extract.left},${extract.top})`,
  );

  let built = 0;
  let skipped = 0;
  for (const width of widths) {
    for (const format of FORMATS) {
      const outName = `${outputStem}-${width}.${format.ext}`;
      const outPath = join(outputDir, outName);
      if (!(await variantNeedsRebuild(sourceFile, outPath))) {
        skipped += 1;
        continue;
      }
      // The extract region is smaller than the source, so we extract
      // first and then resize. Enlargement is intentionally allowed —
      // the 1200w variant exceeds the native extract width — see the
      // PORTRAIT_CROPS comment for the trade-off.
      const pipeline = sharp(sourceFile)
        .extract(extract)
        .resize({ width, fit: 'inside' });
      const writer = format.ext === 'avif'
        ? pipeline.avif(format.options)
        : format.ext === 'webp'
          ? pipeline.webp(format.options)
          : pipeline.jpeg(format.options);
      await writer.toFile(outPath);
      built += 1;
    }
  }
  console.log(`  ${outputStem} — wrote ${built}, skipped ${skipped}`);
  return { built, skipped };
}

async function main() {
  let totalBuilt = 0;
  let totalSkipped = 0;
  for (const source of SOURCES) {
    const { built, skipped } = await processSource(source);
    totalBuilt += built;
    totalSkipped += skipped;
  }
  for (const crop of PORTRAIT_CROPS) {
    const { built, skipped } = await processCrop(crop);
    totalBuilt += built;
    totalSkipped += skipped;
  }

  console.log(`\nDone. ${totalBuilt} written, ${totalSkipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
