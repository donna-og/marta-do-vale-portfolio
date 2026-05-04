#!/usr/bin/env node
//
// Preload coherence guard. Run as part of `npm test`.
//
// `<link rel="preload">` is a *promise* to Chrome that the document will
// fetch this exact URL within ~3s of paint. If the file gets renamed,
// the consuming `<img>` / `@font-face` rule drifts, or the LCP element
// loses its preload, Chrome flags "the preloaded resource was not used"
// in DevTools and the bytes ship without amortising — LCP regresses
// silently. Lighthouse CI catches the score drop after the fact;
// `check-image-variants` catches missing modern-format siblings.
// Neither catches a stale or unconsumed preload.
//
// This guard, run after check-html and check-image-variants, audits
// every `<link rel="preload">` in index.html and 404.html for:
//   • href resolves on disk (and every URL in imagesrcset);
//   • `as` is consistent with the file extension;
//   • `as="font"` carries `crossorigin` (otherwise Chrome ignores it);
//   • `as="image"` with imagesrcset carries imagesizes;
//   • LCP-candidate `<img>` (any `<img fetchpriority="high">`, or the
//     first eager-loaded `<img>` in document order) has a matching
//     image preload covering its src or some srcset URL;
//   • every image preload is consumed by some `<img>` in the static
//     HTML (via src / srcset / imagesrcset);
//   • every font preload is referenced by an `@font-face src: url(…)`
//     in the compiled `styles.css`.
//
// Pure Node stdlib + jsdom (already a dep). No browser, no rebuild.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const TARGETS = ['index.html', '404.html'];

// File extension → expected `as` / `type` pair. Used to flag a preload
// whose declared role conflicts with the file the href actually points
// at (e.g. `as="image"` on a CSS file).
const EXT_EXPECT = {
  woff2: { as: 'font', type: 'font/woff2' },
  woff:  { as: 'font', type: 'font/woff' },
  ttf:   { as: 'font', type: 'font/ttf' },
  otf:   { as: 'font', type: 'font/otf' },
  jpg:   { as: 'image', type: 'image/jpeg' },
  jpeg:  { as: 'image', type: 'image/jpeg' },
  png:   { as: 'image', type: 'image/png' },
  webp:  { as: 'image', type: 'image/webp' },
  avif:  { as: 'image', type: 'image/avif' },
  svg:   { as: 'image', type: 'image/svg+xml' },
  gif:   { as: 'image', type: 'image/gif' },
  css:   { as: 'style', type: 'text/css' },
  js:    { as: 'script', type: 'text/javascript' },
  mjs:   { as: 'script', type: 'text/javascript' },
};

function normalizeHref(href) {
  if (!href) return null;
  let s = String(href).trim();
  if (!s) return null;
  // Strip the canonical site prefix and a leading slash so we can resolve
  // against the project root just like the asset on-disk layout.
  if (s.startsWith('https://www.martadovale.pt/')) {
    s = s.slice('https://www.martadovale.pt/'.length);
  }
  if (s.startsWith('/')) s = s.slice(1);
  return s;
}

function parseSrcset(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(/\s+/)[0]);
}

function describeLink(link) {
  const href = link.getAttribute('href') || '';
  const as = link.getAttribute('as') || '';
  return `<link rel="preload" as="${as}" href="${href.slice(0, 80)}">`;
}

function imgSelector(img, idx) {
  const src = (img.getAttribute('src') || '').slice(0, 60);
  const fp = img.getAttribute('fetchpriority');
  const bits = ['<img'];
  if (fp) bits.push(`fetchpriority="${fp}"`);
  if (src) bits.push(`src="${src}"`);
  bits.push(`#${idx + 1}>`);
  return bits.join(' ');
}

// Practical LCP heuristic for static pages: the first non-lazy `<img>`
// in document order is the candidate paint. Any `<img fetchpriority="high">`
// is also treated as a candidate so authors can opt in explicitly.
function findLcpCandidates(doc) {
  const imgs = [...doc.querySelectorAll('img')];
  const candidates = new Set();
  const explicit = imgs.filter(
    (img) => (img.getAttribute('fetchpriority') || '').toLowerCase() === 'high',
  );
  for (const img of explicit) candidates.add(img);
  const firstEager = imgs.find(
    (img) => (img.getAttribute('loading') || '').toLowerCase() !== 'lazy',
  );
  if (firstEager) candidates.add(firstEager);
  return { imgs, candidates: [...candidates] };
}

function collectImgUrls(img) {
  const urls = new Set();
  const src = img.getAttribute('src');
  if (src) urls.add(normalizeHref(src));
  for (const u of parseSrcset(img.getAttribute('srcset'))) {
    const norm = normalizeHref(u);
    if (norm) urls.add(norm);
  }
  // <picture><source srcset>...<img/></picture> — fallback URLs come
  // through different elements but the matching preload nearly always
  // targets the <img>'s own src/srcset, which is exactly what Chrome
  // resolves for the image fetch on a `<picture>` with art-direction.
  // If the document later relies on AVIF/WebP <source>, expand here.
  return urls;
}

// Shared collection of every <img>-side image URL across the document.
// Used to detect dangling image preloads.
function collectAllImgUrls(doc) {
  const set = new Set();
  for (const img of doc.querySelectorAll('img')) {
    for (const u of collectImgUrls(img)) set.add(u);
  }
  for (const source of doc.querySelectorAll('picture source[srcset]')) {
    for (const u of parseSrcset(source.getAttribute('srcset'))) {
      const norm = normalizeHref(u);
      if (norm) set.add(norm);
    }
  }
  return set;
}

// Pull every url(...) target from `@font-face` blocks in compiled CSS.
// Matches with or without quotes; tolerates whitespace.
function collectFontFaceUrls(css) {
  const set = new Set();
  const blockRe = /@font-face\s*\{[^}]*\}/g;
  const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
  for (const block of css.match(blockRe) || []) {
    let m;
    while ((m = urlRe.exec(block)) !== null) {
      const norm = normalizeHref(m[1]);
      if (norm) set.add(norm);
    }
  }
  return set;
}

function checkPreloadsForFile(file, html, css) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const fails = [];

  const preloads = [...doc.querySelectorAll('link[rel="preload"]')];
  const imageUrlsInDoc = collectAllImgUrls(doc);
  const fontUrlsInCss = collectFontFaceUrls(css);
  const { candidates } = findLcpCandidates(doc);

  // Pass A: validate each preload in isolation.
  for (const link of preloads) {
    const tag = describeLink(link);
    const asAttr = (link.getAttribute('as') || '').toLowerCase();
    const typeAttr = (link.getAttribute('type') || '').toLowerCase();
    const hrefRaw = link.getAttribute('href');
    const href = normalizeHref(hrefRaw);
    const imagesrcsetRaw = link.getAttribute('imagesrcset');
    const imagesizesRaw = link.getAttribute('imagesizes');

    if (!href) {
      fails.push({ code: 'PRELOAD_HREF_MISSING', tag, hint: 'add href= attribute' });
      continue;
    }

    // a. href resolves on disk.
    const abs = join(projectRoot, href);
    if (!existsSync(abs)) {
      fails.push({
        code: 'PRELOAD_HREF_MISSING',
        tag,
        hint: `href "${href}" does not resolve to a file on disk — was the asset renamed?`,
      });
    }

    // b. as= consistent with the file extension.
    const ext = extname(href).slice(1).toLowerCase();
    const expect = EXT_EXPECT[ext];
    if (expect && asAttr && expect.as !== asAttr) {
      fails.push({
        code: 'PRELOAD_AS_MISMATCH',
        tag,
        hint: `extension .${ext} expects as="${expect.as}", got as="${asAttr}"`,
      });
    }

    // c. type= consistent if declared.
    if (expect && typeAttr && expect.type !== typeAttr) {
      fails.push({
        code: 'PRELOAD_TYPE_MISMATCH',
        tag,
        hint: `extension .${ext} expects type="${expect.type}", got type="${typeAttr}"`,
      });
    }

    // d. font preloads must carry crossorigin.
    if (asAttr === 'font' && !link.hasAttribute('crossorigin')) {
      fails.push({
        code: 'PRELOAD_FONT_NO_CROSSORIGIN',
        tag,
        hint: 'add crossorigin — without it Chrome ignores the font preload',
      });
    }

    // e. image preloads with imagesrcset: every URL resolves and
    // imagesizes is set.
    if (asAttr === 'image' && imagesrcsetRaw) {
      const urls = parseSrcset(imagesrcsetRaw);
      for (const u of urls) {
        const norm = normalizeHref(u);
        if (!norm) continue;
        if (!existsSync(join(projectRoot, norm))) {
          fails.push({
            code: 'PRELOAD_IMAGESRCSET_MISSING',
            tag,
            hint: `imagesrcset entry "${u}" does not resolve to a file on disk`,
          });
        }
      }
      if (!imagesizesRaw || !imagesizesRaw.trim()) {
        fails.push({
          code: 'PRELOAD_IMAGESIZES_MISSING',
          tag,
          hint: 'imagesrcset is set but imagesizes is missing',
        });
      }
    }
  }

  // Pass B: every LCP candidate has a matching image preload.
  const imagePreloadUrls = new Set();
  for (const link of preloads) {
    if ((link.getAttribute('as') || '').toLowerCase() !== 'image') continue;
    const href = normalizeHref(link.getAttribute('href'));
    if (href) imagePreloadUrls.add(href);
    for (const u of parseSrcset(link.getAttribute('imagesrcset'))) {
      const norm = normalizeHref(u);
      if (norm) imagePreloadUrls.add(norm);
    }
  }

  const allImgs = [...doc.querySelectorAll('img')];
  for (const img of candidates) {
    const urls = collectImgUrls(img);
    let covered = false;
    for (const u of urls) {
      if (imagePreloadUrls.has(u)) {
        covered = true;
        break;
      }
    }
    if (!covered) {
      const idx = allImgs.indexOf(img);
      fails.push({
        code: 'LCP_PRELOAD_MISSING',
        tag: imgSelector(img, idx),
        hint:
          'LCP candidate has no matching <link rel="preload" as="image"> — ' +
          'paint will block on fetch',
      });
    }
  }

  // Pass C: dangling image preloads (preload pointing at an image that
  // no <img> in the document consumes).
  for (const link of preloads) {
    if ((link.getAttribute('as') || '').toLowerCase() !== 'image') continue;
    const tag = describeLink(link);
    const candidates = new Set();
    const href = normalizeHref(link.getAttribute('href'));
    if (href) candidates.add(href);
    for (const u of parseSrcset(link.getAttribute('imagesrcset'))) {
      const norm = normalizeHref(u);
      if (norm) candidates.add(norm);
    }
    let consumed = false;
    for (const u of candidates) {
      if (imageUrlsInDoc.has(u)) {
        consumed = true;
        break;
      }
    }
    if (!consumed) {
      fails.push({
        code: 'PRELOAD_DANGLING_IMAGE',
        tag,
        hint:
          'image preload is not consumed by any <img> in the document — ' +
          'the consuming element was renamed or removed',
      });
    }
  }

  // Pass D: dangling font preloads (preload pointing at a font that no
  // @font-face rule in the compiled CSS uses).
  for (const link of preloads) {
    if ((link.getAttribute('as') || '').toLowerCase() !== 'font') continue;
    const tag = describeLink(link);
    const href = normalizeHref(link.getAttribute('href'));
    if (!href) continue;
    if (!fontUrlsInCss.has(href)) {
      fails.push({
        code: 'PRELOAD_DANGLING_FONT',
        tag,
        hint:
          'font preload is not referenced by any @font-face rule in styles.css — ' +
          'the @font-face src was renamed or the preload is stale',
      });
    }
  }

  return { file, preloadCount: preloads.length, fails };
}

// ---------- run ----------

const css = await readFile(join(projectRoot, 'styles.css'), 'utf8');
const reports = [];
for (const file of TARGETS) {
  const html = await readFile(join(projectRoot, file), 'utf8');
  reports.push(checkPreloadsForFile(file, html, css));
}

const fileWidth = Math.max(...reports.map((r) => r.file.length));
let totalFails = 0;
for (const r of reports) {
  const status = r.fails.length === 0 ? 'ok' : 'FAIL';
  totalFails += r.fails.length;
  console.log(
    `${status.padEnd(4)}  ${r.file.padEnd(fileWidth)}  ` +
      `preload coherence  ${r.preloadCount - r.fails.length}/${r.preloadCount} clean`,
  );
}

if (totalFails > 0) {
  console.log('');
  const codeWidth = Math.max(
    ...reports.flatMap((r) => r.fails.map((f) => f.code.length)),
    4,
  );
  console.log(`        ${'CODE'.padEnd(codeWidth)}  DETAIL`);
  for (const r of reports) {
    for (const f of r.fails) {
      console.log(
        `        ${f.code.padEnd(codeWidth)}  ${r.file} — ${f.tag}`,
      );
      console.log(`        ${' '.repeat(codeWidth)}  hint: ${f.hint}`);
    }
  }
}

const totalPreloads = reports.reduce((n, r) => n + r.preloadCount, 0);
console.log(
  `\n${reports.length} files · ${totalPreloads} preloads · ${totalFails} failed`,
);

if (totalFails > 0) {
  console.error(
    '\nPreload coherence check failed. Each <link rel="preload"> must ' +
      'point at a real file, declare the right `as`, and be paired with ' +
      'the consuming <img> / @font-face. Renames must move both the ' +
      'preload and its consumer together.',
  );
  process.exit(1);
}
