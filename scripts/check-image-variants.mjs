#!/usr/bin/env node
//
// AVIF/WebP companion guard. Run as part of `npm test`.
//
// The image build emits a .{avif,webp,jpg} sextet per source (two widths)
// for posters and hero shots. The <picture> blocks in index.html and the
// JS-rendered film tiles assume those modern-format siblings exist — when
// only the JPG ships, the page still works but silently falls back, the
// byte savings evaporate, and the perf-budget regression hides until
// Lighthouse catches it on the next CI run.
//
// This guard checks, for every JPG/PNG that markup actually references in
// the four shipped surfaces below, that matching .avif and .webp files
// sit alongside it on disk. Allowlist covers PNG-only formats (OG card,
// favicons, manifest icons) where modern formats are not yet portable
// across consumers (link unfurlers, browsers reading rel="icon").
//
// Sister check: any orphaned .avif/.webp without a JPG/PNG sibling emits
// a WARN (not a FAIL) since orphans are usually a stale-source leftover,
// not a runtime defect.
//
// Pure Node stdlib + jsdom (already a dep). Source-only check; no rebuild.
// Hint on FAIL: run `npm run build:images`.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const SITE_PREFIX = 'https://www.martadovale.pt/';

// Directories whose JPG/PNG output is required to ship with .avif/.webp
// siblings (modulo the allowlist below). Other asset roots — fonts, the
// abstract SVGs in assets/cinema/, the un-optimized originals in
// assets/posters/ and assets/cinema/posters/ — are out of scope and are
// not walked.
const SCOPE_DIRS = [
  'assets/posters/optimized',
  'assets/cinema/posters/optimized',
  'assets/images/optimized',
  'assets/icons',
  'assets/social',
];

// PNG-only files that legitimately ship without modern-format siblings:
// link unfurlers (Slack, Twitter, etc.) still reject WebP/AVIF for
// og:image, and apple-touch-icon / favicon / PWA-manifest icon slots
// expect PNG by spec. Match on basename prefix.
const ALLOWLIST_PREFIXES = [
  'og-card',
  'apple-touch-icon',
  'favicon',
  'icon-',
];

const isAllowlisted = (relPath) => {
  const base = parse(relPath).base;
  return ALLOWLIST_PREFIXES.some((p) => base.startsWith(p));
};

// Art-directed crop sextets that the markup loads via media-conditional
// <picture><source>. These have no companion source JPG in
// assets/images/ — they live only under optimized/ — so the
// reference-walker would skip them, and the sibling-check has no
// reference to expand. Enforce existence explicitly.
//
// Each entry is the stem under `assets/images/optimized/`. The widths
// match scripts/build-images.mjs's PORTRAIT_CROPS — keep both lists in
// step when adding new crops.
const REQUIRED_CROP_SEXTETS = [
  { stem: 'hero-living-room-portrait', widths: [600, 1200] },
];

function requiredCropFiles() {
  const out = [];
  for (const { stem, widths } of REQUIRED_CROP_SEXTETS) {
    for (const w of widths) {
      for (const ext of ['avif', 'webp', 'jpg']) {
        out.push(`assets/images/optimized/${stem}-${w}.${ext}`);
      }
    }
  }
  return out;
}

// `posterSources` in script.js maps each `assets/posters/<name>.jpg` in
// the films array to a sextet under assets/posters/optimized/. The
// expansion below mirrors that runtime transform so a film entry counts
// as a reference to all six derived files. assets/images/ uses the same
// shape but with widths {800, 1600} (see scripts/build-images.mjs).
function expandLogicalReference(ref) {
  let m = ref.match(/^assets\/posters\/([^/]+)\.jpe?g$/i);
  if (m) {
    const stem = m[1];
    return [
      `assets/posters/optimized/${stem}-400.jpg`,
      `assets/posters/optimized/${stem}-800.jpg`,
      `assets/posters/optimized/${stem}-400.avif`,
      `assets/posters/optimized/${stem}-800.avif`,
      `assets/posters/optimized/${stem}-400.webp`,
      `assets/posters/optimized/${stem}-800.webp`,
    ];
  }
  m = ref.match(/^assets\/images\/([^/]+)\.jpe?g$/i);
  if (m) {
    const stem = m[1];
    return [
      `assets/images/optimized/${stem}-800.jpg`,
      `assets/images/optimized/${stem}-1600.jpg`,
      `assets/images/optimized/${stem}-800.avif`,
      `assets/images/optimized/${stem}-1600.avif`,
      `assets/images/optimized/${stem}-800.webp`,
      `assets/images/optimized/${stem}-1600.webp`,
    ];
  }
  return [ref];
}

function normalizePath(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  if (s.startsWith(SITE_PREFIX)) s = s.slice(SITE_PREFIX.length);
  if (s.startsWith('/')) s = s.slice(1);
  if (!s.startsWith('assets/')) return null;
  return s;
}

const ASSET_PATH_RE =
  /(?:https:\/\/www\.martadovale\.pt\/)?assets\/(?:posters|images|icons|social|cinema)\/[^"'\s)<>]+?\.(?:jpe?g|png|avif|webp)/gi;

function collectFromText(text, set) {
  if (!text) return;
  for (const match of text.matchAll(ASSET_PATH_RE)) {
    const norm = normalizePath(match[0]);
    if (norm) set.add(norm);
  }
}

function collectFromHtml(html, set) {
  collectFromText(html, set);
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const grab = (sel, attr) => {
    for (const el of doc.querySelectorAll(sel)) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      if (attr === 'srcset') {
        for (const part of v.split(',')) {
          const url = part.trim().split(/\s+/)[0];
          const norm = normalizePath(url);
          if (norm) set.add(norm);
        }
      } else {
        const norm = normalizePath(v);
        if (norm) set.add(norm);
      }
    }
  };
  grab('img[src]', 'src');
  grab('source[srcset]', 'srcset');
  grab('link[href]', 'href');
  grab('meta[content]', 'content');
}

function collectFromSitemap(xml, set) {
  for (const m of xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) {
    const norm = normalizePath(m[1]);
    if (norm) set.add(norm);
  }
}

async function walkFiles(relDir, out = []) {
  const abs = join(projectRoot, relDir);
  if (!existsSync(abs)) return out;
  for (const entry of await readdir(abs, { withFileTypes: true })) {
    const rel = `${relDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await walkFiles(rel, out);
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
  return out;
}

function siblingPath(relPath, ext) {
  const { dir, name } = parse(relPath);
  return `${dir}/${name}.${ext}`;
}

// ---------- collect references ----------

const references = new Set();
const indexHtml = await readFile(join(projectRoot, 'index.html'), 'utf8');
const notFoundHtml = await readFile(join(projectRoot, '404.html'), 'utf8');
const scriptJs = await readFile(join(projectRoot, 'script.js'), 'utf8');
const sitemapXml = await readFile(join(projectRoot, 'sitemap.xml'), 'utf8');

collectFromHtml(indexHtml, references);
collectFromHtml(notFoundHtml, references);
collectFromText(scriptJs, references);
collectFromSitemap(sitemapXml, references);

const expandedReferences = new Set();
for (const ref of references) {
  for (const e of expandLogicalReference(ref)) expandedReferences.add(e);
}

// ---------- walk on-disk files ----------

const onDisk = [];
for (const dir of SCOPE_DIRS) await walkFiles(dir, onDisk);

const onDiskSet = new Set(onDisk);
const fails = [];
const warns = [];

// Pass 1: every referenced JPG/PNG (modulo allowlist) must have .avif and
// .webp siblings on disk.
const sortedRefs = [...expandedReferences].sort();
for (const ref of sortedRefs) {
  if (!/\.(jpe?g|png)$/i.test(ref)) continue;
  if (!SCOPE_DIRS.some((d) => ref.startsWith(`${d}/`))) continue;
  if (!onDiskSet.has(ref)) continue; // unrelated; check-films-sync covers existence
  if (isAllowlisted(ref)) continue;
  const missing = [];
  for (const ext of ['avif', 'webp']) {
    if (!onDiskSet.has(siblingPath(ref, ext))) missing.push(`.${ext}`);
  }
  if (missing.length) fails.push({ code: 'IMG_VARIANT_MISSING', path: ref, missing });
}

// Pass 1b: every required art-directed crop file must exist on disk.
// Drift-prevention for the portrait sextet (and any future crops) — if
// the build script is edited to drop a width or format, this trips.
for (const required of requiredCropFiles()) {
  if (!onDiskSet.has(required)) {
    fails.push({ code: 'CROP_VARIANT_MISSING', path: required, missing: ['file'] });
  }
}

// Pass 2: orphan .avif/.webp with no JPG/PNG companion.
for (const file of onDisk) {
  if (!/\.(avif|webp)$/i.test(file)) continue;
  if (isAllowlisted(file)) continue;
  const hasJpg = onDiskSet.has(siblingPath(file, 'jpg'));
  const hasJpeg = onDiskSet.has(siblingPath(file, 'jpeg'));
  const hasPng = onDiskSet.has(siblingPath(file, 'png'));
  if (!hasJpg && !hasJpeg && !hasPng) {
    warns.push({ code: 'IMG_VARIANT_ORPHAN', path: file });
  }
}

// ---------- report ----------

const totalReferenced = sortedRefs.filter(
  (r) => /\.(jpe?g|png)$/i.test(r) &&
    SCOPE_DIRS.some((d) => r.startsWith(`${d}/`)) &&
    onDiskSet.has(r) &&
    !isAllowlisted(r),
).length;

console.log(
  `${(fails.length ? 'FAIL' : 'ok').padEnd(4)}  ` +
  `image variants  ${(totalReferenced - fails.length)}/${totalReferenced} sextets intact`,
);
console.log(
  `${(warns.length ? 'warn' : 'ok').padEnd(4)}  ` +
  `image variants  ${warns.length} orphan(s)`,
);

if (fails.length) {
  console.log('');
  for (const f of fails) {
    console.log(`[FAIL] ${f.code}  ${f.path}`);
    console.log(`       missing: ${f.missing.join(', ')}`);
    console.log('       hint: run `npm run build:images` to regenerate');
  }
}

if (warns.length) {
  console.log('');
  for (const w of warns) {
    console.log(`[warn] ${w.code}  ${w.path}`);
    console.log('       no .jpg/.png sibling — likely leftover from a removed source');
  }
}

console.log(
  `\n${SCOPE_DIRS.length} dirs · ${onDisk.length} files on disk · ` +
  `${expandedReferences.size} references · ` +
  `${fails.length} failed · ${warns.length} warned`,
);

if (fails.length) {
  console.error(
    '\nImage variant check failed. Every referenced JPG/PNG outside the ' +
    'OG-card / favicon / manifest-icon allowlist must ship with matching ' +
    '.avif and .webp siblings. Run `npm run build:images` to regenerate.',
  );
  process.exit(1);
}
