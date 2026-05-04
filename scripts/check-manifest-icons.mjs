#!/usr/bin/env node
//
// Web manifest + head-link icon integrity guard. Run as part of
// `npm test`.
//
// `site.webmanifest` declares three PWA icons and `<head>` declares
// three more (favicon SVG, favicon-32 PNG, apple-touch-icon PNG). None
// of these are validated today — a contributor who renames an asset,
// declares the wrong `sizes`, or ships a PNG whose decoded dimensions
// don't match the declaration ships a broken installable card. Chrome
// silently falls back to a generic icon, the manifest still parses,
// no test fails. This guard closes that gap.
//
// Same family as `check-preload-coherence` (preload ↔ <img>/@font-face),
// `check-image-variants` (referenced JPG ↔ on-disk sextet), and
// `check-contact-parity` (visible page ↔ Person JSON-LD): the file
// system, the markup, and the manifest must agree.
//
// Pure Node stdlib + jsdom + sharp (already deps; sharp ships with
// build-images.mjs). No network, no file modifications.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const MANIFEST_PATH = 'site.webmanifest';
const HTML_TARGETS = ['index.html', '404.html'];

// Body background; the install splash screen and theme color must match
// the site so the PWA card doesn't render a default white frame.
const SITE_BG = '#0b0b0d';

// "browser" produces no installable UX benefit — the manifest exists
// but Chrome shows a normal tab. Reject it: if the site declares a
// manifest, it should opt in to one of the three modes that surface
// the PWA card.
const ALLOWED_DISPLAY = new Set(['standalone', 'fullscreen', 'minimal-ui']);

const REQUIRED_MANIFEST_KEYS = [
  'name',
  'short_name',
  'start_url',
  'display',
  'background_color',
  'theme_color',
  'icons',
];

// Apple's documented minimum apple-touch-icon size. Anything smaller
// gets stretched into the home-screen tile.
const APPLE_TOUCH_MIN = 180;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const EXT_TO_TYPE = {
  png: 'image/png',
  svg: 'image/svg+xml',
};

function normalizeColor(c) {
  return typeof c === 'string' ? c.trim().toLowerCase() : '';
}

function normalizeHref(href) {
  if (!href) return null;
  let s = String(href).trim();
  if (!s) return null;
  if (s.startsWith('https://www.martadovale.pt/')) {
    s = s.slice('https://www.martadovale.pt/'.length);
  }
  if (s.startsWith('/')) s = s.slice(1);
  return s;
}

// One row per assertion class. `count` is the number of items inspected;
// `fails` is the subset whose value did not satisfy the assertion. An ok
// row prints `count`/`count`; a FAIL row prints one offender per failure
// with file path, expected value, and observed value.
function makeRow(label) {
  return { label, count: 0, fails: [] };
}

async function readImageMeta(absPath) {
  try {
    const meta = await sharp(absPath).metadata();
    return { width: meta.width, height: meta.height, format: meta.format };
  } catch (err) {
    return { error: err.message };
  }
}

// ---------- manifest parse + shape ----------

const manifestRaw = await readFile(join(projectRoot, MANIFEST_PATH), 'utf8');
let manifest;
try {
  manifest = JSON.parse(manifestRaw);
} catch (err) {
  console.error(
    `FAIL  ${MANIFEST_PATH}  parse  cannot JSON.parse — ${err.message}`,
  );
  process.exit(1);
}

const rows = [];

// 1. Required top-level keys present.
const shapeRow = makeRow('manifest top-level keys');
for (const key of REQUIRED_MANIFEST_KEYS) {
  shapeRow.count += 1;
  if (!(key in manifest)) {
    shapeRow.fails.push({
      target: MANIFEST_PATH,
      observed: '(missing)',
      expected: `key "${key}" present`,
    });
  }
}
rows.push(shapeRow);

// 2. display value.
const displayRow = makeRow('manifest display mode');
displayRow.count = 1;
const display = manifest.display;
if (!ALLOWED_DISPLAY.has(display)) {
  displayRow.fails.push({
    target: MANIFEST_PATH,
    observed: JSON.stringify(display),
    expected: `one of ${[...ALLOWED_DISPLAY].map((v) => `"${v}"`).join(' | ')}`,
  });
}
rows.push(displayRow);

// 3. theme_color and background_color: hex shape + match site bg.
const colorRow = makeRow('manifest theme/background color');
for (const key of ['theme_color', 'background_color']) {
  colorRow.count += 1;
  const value = manifest[key];
  if (typeof value !== 'string' || !HEX_RE.test(value)) {
    colorRow.fails.push({
      target: `${MANIFEST_PATH} ${key}`,
      observed: JSON.stringify(value),
      expected: '#RRGGBB hex',
    });
    continue;
  }
  if (normalizeColor(value) !== SITE_BG) {
    colorRow.fails.push({
      target: `${MANIFEST_PATH} ${key}`,
      observed: value,
      expected: SITE_BG,
    });
  }
}
rows.push(colorRow);

// 4. Each icon entry: src resolves, type matches extension, sizes
//    matches decoded dimensions, maskable convention.
const manifestIcons = Array.isArray(manifest.icons) ? manifest.icons : [];

const iconResolveRow = makeRow('manifest icon src on disk');
const iconTypeRow = makeRow('manifest icon type ↔ extension');
const iconSizesRow = makeRow('manifest icon sizes ↔ decoded dimensions');
const iconMaskableRow = makeRow('manifest icon maskable filename convention');

// Cache decoded metadata so the head-link check below can reuse it
// when the same file is referenced from both surfaces.
const metaCache = new Map();
async function getMeta(relPath) {
  if (metaCache.has(relPath)) return metaCache.get(relPath);
  const abs = join(projectRoot, relPath);
  if (!existsSync(abs)) {
    const v = { error: 'file not found' };
    metaCache.set(relPath, v);
    return v;
  }
  const ext = extname(relPath).slice(1).toLowerCase();
  // sharp can read SVG, but the "decoded dimensions" check for SVG is
  // not meaningful (vector); skip and report extension-known sizes.
  const m = await readImageMeta(abs);
  metaCache.set(relPath, { ...m, ext });
  return metaCache.get(relPath);
}

for (const [i, entry] of manifestIcons.entries()) {
  const tag = `icons[${i}]`;
  const src = entry && typeof entry.src === 'string' ? entry.src : '';
  const sizes = entry && typeof entry.sizes === 'string' ? entry.sizes : '';
  const declaredType = entry && typeof entry.type === 'string' ? entry.type : '';
  const purpose = entry && typeof entry.purpose === 'string' ? entry.purpose : '';

  // a. src resolves.
  iconResolveRow.count += 1;
  const rel = normalizeHref(src);
  const abs = rel ? join(projectRoot, rel) : null;
  const onDisk = abs && existsSync(abs);
  if (!onDisk) {
    iconResolveRow.fails.push({
      target: `${MANIFEST_PATH} ${tag}`,
      observed: JSON.stringify(src),
      expected: 'path resolving to a file on disk',
    });
  }

  // b. type matches extension.
  iconTypeRow.count += 1;
  const ext = rel ? extname(rel).slice(1).toLowerCase() : '';
  const expectedType = EXT_TO_TYPE[ext];
  if (!expectedType) {
    iconTypeRow.fails.push({
      target: `${MANIFEST_PATH} ${tag}`,
      observed: `.${ext || '(none)'}`,
      expected: `extension in ${Object.keys(EXT_TO_TYPE).map((e) => `.${e}`).join(', ')}`,
    });
  } else if (declaredType && declaredType !== expectedType) {
    iconTypeRow.fails.push({
      target: `${MANIFEST_PATH} ${tag}`,
      observed: `type=${JSON.stringify(declaredType)} for .${ext}`,
      expected: `type="${expectedType}"`,
    });
  }

  // c. sizes matches decoded dimensions.
  iconSizesRow.count += 1;
  if (!sizes) {
    iconSizesRow.fails.push({
      target: `${MANIFEST_PATH} ${tag}`,
      observed: '(no sizes attribute)',
      expected: 'sizes="WxH"',
    });
  } else if (!/^\d+x\d+$/.test(sizes)) {
    iconSizesRow.fails.push({
      target: `${MANIFEST_PATH} ${tag}`,
      observed: JSON.stringify(sizes),
      expected: 'sizes="WxH"',
    });
  } else if (onDisk) {
    const [declW, declH] = sizes.split('x').map((n) => parseInt(n, 10));
    const meta = await getMeta(rel);
    if (meta.error) {
      iconSizesRow.fails.push({
        target: `${MANIFEST_PATH} ${tag}`,
        observed: `cannot decode (${meta.error})`,
        expected: `${declW}x${declH}`,
      });
    } else if (meta.width !== declW || meta.height !== declH) {
      iconSizesRow.fails.push({
        target: `${MANIFEST_PATH} ${tag}`,
        observed: `${meta.width}x${meta.height} on disk`,
        expected: `${declW}x${declH} (declared)`,
      });
    }
  }
  // If !onDisk, the src-on-disk row already reported the missing file;
  // skip the size comparison rather than emit a confusing second row.

  // d. maskable convention.
  if (purpose && purpose.split(/\s+/).includes('maskable')) {
    iconMaskableRow.count += 1;
    const base = rel ? basename(rel) : '';
    if (!/maskable/i.test(base)) {
      iconMaskableRow.fails.push({
        target: `${MANIFEST_PATH} ${tag}`,
        observed: base,
        expected: 'filename containing "maskable"',
      });
    }
  }
}

rows.push(iconResolveRow);
rows.push(iconTypeRow);
rows.push(iconSizesRow);
// Always emit the maskable row so the assertion class shows in output,
// even when no maskable icon is declared (count=0 → trivially ok).
rows.push(iconMaskableRow);

// ---------- head-link checks ----------

const headHrefRow = makeRow('<head> icon link href on disk');
const headTypeRow = makeRow('<head> icon link type ↔ extension');
const headFavicon32Row = makeRow('<head> favicon-32 decoded dimensions');
const headAppleRow = makeRow('<head> apple-touch-icon ≥ 180x180 PNG');
const headManifestRow = makeRow('<head> rel="manifest" href');

// Track every href referenced from <head> so the cross-check below can
// flag any path also in the manifest (allowed, but the file must satisfy
// both sets of constraints — verified by reusing the same on-disk meta
// across both surfaces, which the metaCache already does).
const headHrefs = new Map(); // rel → Set<source-label>

for (const file of HTML_TARGETS) {
  const html = await readFile(join(projectRoot, file), 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const links = [
    ...doc.querySelectorAll(
      'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
    ),
  ];

  for (const link of links) {
    const rel = (link.getAttribute('rel') || '').toLowerCase();
    const hrefRaw = link.getAttribute('href') || '';
    const sizes = link.getAttribute('sizes') || '';
    const declaredType = (link.getAttribute('type') || '').toLowerCase();
    const tag = `<link rel="${rel}"${sizes ? ` sizes="${sizes}"` : ''} href="${hrefRaw}">`;

    const norm = normalizeHref(hrefRaw);
    const abs = norm ? join(projectRoot, norm) : null;
    const onDisk = abs && existsSync(abs);

    // a. href resolves.
    headHrefRow.count += 1;
    if (!onDisk) {
      headHrefRow.fails.push({
        target: `${file} ${tag}`,
        observed: JSON.stringify(hrefRaw),
        expected: 'path resolving to a file on disk',
      });
      continue;
    }

    if (norm) {
      if (!headHrefs.has(norm)) headHrefs.set(norm, new Set());
      headHrefs.get(norm).add(`${file} ${tag}`);
    }

    // b. extension matches declared type (when type is declared).
    if (rel === 'manifest') {
      headManifestRow.count += 1;
      // Manifest must be the file the guard already validated.
      if (norm !== MANIFEST_PATH) {
        headManifestRow.fails.push({
          target: `${file} ${tag}`,
          observed: norm,
          expected: MANIFEST_PATH,
        });
      }
      continue;
    }

    const ext = norm ? extname(norm).slice(1).toLowerCase() : '';
    const expectedType = EXT_TO_TYPE[ext];
    headTypeRow.count += 1;
    if (!expectedType) {
      headTypeRow.fails.push({
        target: `${file} ${tag}`,
        observed: `.${ext || '(none)'}`,
        expected: `extension in ${Object.keys(EXT_TO_TYPE).map((e) => `.${e}`).join(', ')}`,
      });
    } else if (declaredType && declaredType !== expectedType) {
      headTypeRow.fails.push({
        target: `${file} ${tag}`,
        observed: `type="${declaredType}" for .${ext}`,
        expected: `type="${expectedType}"`,
      });
    }

    // c. rel="icon" sizes="32x32" → decoded must be 32x32.
    if (rel === 'icon' && sizes === '32x32') {
      headFavicon32Row.count += 1;
      const meta = await getMeta(norm);
      if (meta.error) {
        headFavicon32Row.fails.push({
          target: `${file} ${tag}`,
          observed: `cannot decode (${meta.error})`,
          expected: '32x32',
        });
      } else if (meta.width !== 32 || meta.height !== 32) {
        headFavicon32Row.fails.push({
          target: `${file} ${tag}`,
          observed: `${meta.width}x${meta.height} on disk`,
          expected: '32x32',
        });
      }
    }

    // d. apple-touch-icon ≥ 180x180 PNG.
    if (rel === 'apple-touch-icon') {
      headAppleRow.count += 1;
      if (ext !== 'png') {
        headAppleRow.fails.push({
          target: `${file} ${tag}`,
          observed: `.${ext}`,
          expected: '.png',
        });
      } else {
        const meta = await getMeta(norm);
        if (meta.error) {
          headAppleRow.fails.push({
            target: `${file} ${tag}`,
            observed: `cannot decode (${meta.error})`,
            expected: `≥ ${APPLE_TOUCH_MIN}x${APPLE_TOUCH_MIN} PNG`,
          });
        } else if (meta.width < APPLE_TOUCH_MIN || meta.height < APPLE_TOUCH_MIN) {
          headAppleRow.fails.push({
            target: `${file} ${tag}`,
            observed: `${meta.width}x${meta.height} on disk`,
            expected: `≥ ${APPLE_TOUCH_MIN}x${APPLE_TOUCH_MIN}`,
          });
        }
      }
    }
  }
}

rows.push(headHrefRow);
rows.push(headTypeRow);
rows.push(headFavicon32Row);
rows.push(headAppleRow);
rows.push(headManifestRow);

// ---------- cross-check: aliased paths satisfy both rule sets ----------
//
// If a path is referenced from BOTH the manifest and a <head> link,
// the file must satisfy whichever rule each surface attaches to it.
// The per-surface checks above already enforce that — this row exists
// to surface the aliasing case in the report so a future contributor
// notices when a single file is doing double duty.
const aliasRow = makeRow('manifest ↔ <head> aliased icon paths');
const manifestPaths = new Set(
  manifestIcons
    .map((e) => e && typeof e.src === 'string' ? normalizeHref(e.src) : null)
    .filter(Boolean),
);
for (const headPath of headHrefs.keys()) {
  if (manifestPaths.has(headPath)) {
    aliasRow.count += 1;
    // No fail rule here — the per-surface checks above already validated
    // the file against both sets of constraints. This row is informational.
  }
}
rows.push(aliasRow);

// ---------- report ----------

const labelWidth = Math.max(...rows.map((r) => r.label.length));
let totalFails = 0;
for (const r of rows) {
  const ok = r.fails.length === 0;
  if (!ok) totalFails += r.fails.length;
  const status = ok ? 'ok' : 'FAIL';
  const passed = r.count - r.fails.length;
  console.log(
    `${status.padEnd(4)}  ${r.label.padEnd(labelWidth)}  ${passed}/${r.count}`,
  );
}

if (totalFails > 0) {
  console.log('');
  console.log('        ASSERTION                              OBSERVED  →  EXPECTED');
  for (const r of rows) {
    if (!r.fails.length) continue;
    for (const f of r.fails) {
      console.log(
        `        [${r.label}] ${f.target}\n          observed: ${f.observed}\n          expected: ${f.expected}`,
      );
    }
  }
  console.error(
    `\nManifest icon check failed (${totalFails} offender${totalFails === 1 ? '' : 's'}). ` +
      'Every manifest icon and every <head> icon link must point at a ' +
      'file whose on-disk dimensions match the declared sizes. Renames ' +
      'must move the asset, the manifest entry, and (if applicable) the ' +
      '<head> link together.',
  );
  process.exit(1);
}

const totalAssertions = rows.reduce((n, r) => n + r.count, 0);
console.log(
  `\n${rows.length} assertion classes · ${totalAssertions} assertions · ` +
    `${manifestIcons.length} manifest icons · ${headHrefs.size} head-link assets`,
);
