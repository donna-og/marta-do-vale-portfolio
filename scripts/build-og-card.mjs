#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const svgPath = join(projectRoot, 'assets', 'social', 'og-card.svg');
const pngPath = join(projectRoot, 'assets', 'social', 'og-card.png');
const jpgPath = join(projectRoot, 'assets', 'social', 'og-card.jpg');

execFileSync('rsvg-convert', [svgPath, '-w', '1200', '-h', '630', '-o', pngPath], {
  stdio: 'inherit'
});

const optimizedPng = await sharp(pngPath)
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();
await sharp(optimizedPng).toFile(pngPath);

await sharp(pngPath)
  .jpeg({ quality: 82, mozjpeg: true, progressive: true })
  .toFile(jpgPath);

console.log(`Wrote ${pngPath} and ${jpgPath}`);
