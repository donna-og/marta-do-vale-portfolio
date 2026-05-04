#!/usr/bin/env node
//
// HTML / JSON-LD correctness guard. Run as part of `npm test`.
//
// Curated set of checks that catch real, observed failure modes in
// index.html and 404.html: a missing alt that breaks a screen reader, a
// stray comma that shreds a JSON-LD block (Google renders that as no
// schema at all), a duplicate id, a target="_blank" without rel
// noreferrer/noopener, a skip-link that drifted out of first-focusable
// position. jsdom (already a dependency) parses; the rules are explicit,
// named, and surface as a labelled FAIL row with a code that identifies
// the failure class. Not a full W3C validator — by design.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const TARGETS = [
  {
    file: 'index.html',
    requireDescription: true,
    requireCsp: true,
    requirePermissionsPolicy: true,
    requireSkipLink: true,
  },
  {
    file: '404.html',
    requireDescription: false,
    requireCsp: false,
    requirePermissionsPolicy: false,
    requireSkipLink: false,
  },
];

// <a> elements that legitimately omit href because their click is wired
// in JS. Keep narrow — the codebase prefers <button> for these and this
// list should rarely grow.
const HREF_ALLOWLIST_ATTRS = ['data-contact-open'];

// jsdom doesn't expose source positions, so for json-ld parse failures
// we approximate the line number by scanning the raw HTML for each
// `<script type="application/ld+json">` opener in document order.
function jsonLdSourceLines(html) {
  const lines = [];
  const re = /<script\s+type="application\/ld\+json"[^>]*>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    lines.push(html.slice(0, m.index).split('\n').length);
  }
  return lines;
}

// Same trick for <img> openers — used by the CLS guard to point a FAIL
// row at the offending source line.
function imgSourceLines(html) {
  const lines = [];
  const re = /<img\b/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    lines.push(html.slice(0, m.index).split('\n').length);
  }
  return lines;
}

function describeElement(el) {
  const tag = el.tagName.toLowerCase();
  const cls = (el.getAttribute('class') || '').trim().slice(0, 40);
  const src = (el.getAttribute('src') || el.getAttribute('href') || '').slice(0, 60);
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const bits = [tag];
  if (src) bits.push(`href/src="${src}"`);
  else if (cls) bits.push(`class="${cls}"`);
  if (text) bits.push(`"${text}"`);
  return `<${bits.join(' ')}>`;
}

function checksFor(html, opts) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const results = [];

  // a. <html lang="...">
  const lang = (doc.documentElement.getAttribute('lang') || '').trim();
  results.push({
    label: 'lang',
    code: 'MISSING_LANG',
    ok: lang.length > 0,
    detail: lang.length > 0 ? lang : '(missing)',
  });

  // b. required head meta
  const titleEl = doc.querySelector('head title');
  const headChecks = [
    { name: 'meta charset', present: !!doc.querySelector('head meta[charset]') },
    { name: 'meta viewport', present: !!doc.querySelector('head meta[name="viewport"]') },
    { name: 'title', present: !!titleEl && (titleEl.textContent || '').trim().length > 0 },
  ];
  if (opts.requireDescription) {
    const m = doc.querySelector('head meta[name="description"]');
    headChecks.push({
      name: 'meta description',
      present: !!m && (m.getAttribute('content') || '').trim().length > 0,
    });
  }
  if (opts.requireCsp) {
    headChecks.push({
      name: 'meta CSP',
      present: !!doc.querySelector('head meta[http-equiv="Content-Security-Policy"]'),
    });
  }
  if (opts.requirePermissionsPolicy) {
    headChecks.push({
      name: 'meta Permissions-Policy',
      present: !!doc.querySelector('head meta[http-equiv="Permissions-Policy"]'),
    });
  }
  const headMissing = headChecks.filter(r => !r.present).map(r => r.name);
  results.push({
    label: 'required head meta',
    code: 'MISSING_HEAD_META',
    ok: headMissing.length === 0,
    detail:
      headMissing.length === 0
        ? `${headChecks.length}/${headChecks.length} present`
        : `${headChecks.length - headMissing.length}/${headChecks.length} present`,
    failExtra: headMissing.map(n => `missing: ${n}`),
  });

  // c. every <img> has a non-empty alt (alt="" explicitly OK, null is not)
  const imgs = [...doc.querySelectorAll('img')];
  const imgsBad = imgs.filter(img => img.getAttribute('alt') === null);
  results.push({
    label: 'img alt',
    code: 'IMG_MISSING_ALT',
    ok: imgsBad.length === 0,
    detail: `${imgs.length - imgsBad.length}/${imgs.length}`,
    failExtra: imgsBad.map(describeElement),
  });

  // c2. every <img> reserves its box: explicit width+height OR an
  // aspect-ratio inline style. Catches the cause of CLS regressions
  // before Lighthouse measures them. SVGs scale and don't trigger CLS
  // the same way — allowlist by extension.
  const imgLines = imgSourceLines(html);
  const imgDimBad = [];
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    const src = img.getAttribute('src') || '';
    if (/\.svg(?:$|[?#])/i.test(src)) continue;
    const w = (img.getAttribute('width') || '').trim();
    const h = (img.getAttribute('height') || '').trim();
    const style = img.getAttribute('style') || '';
    const hasDims = w.length > 0 && h.length > 0;
    const hasAspect = /aspect-ratio\s*:/i.test(style);
    if (hasDims || hasAspect) continue;
    imgDimBad.push({ src, line: imgLines[i] });
  }
  results.push({
    label: 'img dimensions',
    code: 'IMG_DIM_MISSING',
    ok: imgDimBad.length === 0,
    detail: `${imgs.length - imgDimBad.length}/${imgs.length}`,
    failExtra: imgDimBad.map(b => `line ~${b.line} src="${b.src}"`),
  });

  // d. every <a> has a non-empty href, unless allowlisted by JS-driver attr
  const anchors = [...doc.querySelectorAll('a')];
  const anchorsBad = anchors.filter(a => {
    const href = a.getAttribute('href');
    const allowlisted = HREF_ALLOWLIST_ATTRS.some(attr => a.hasAttribute(attr));
    if (allowlisted) return false;
    return href === null || href === '';
  });
  results.push({
    label: 'a href',
    code: 'A_MISSING_HREF',
    ok: anchorsBad.length === 0,
    detail: `${anchors.length - anchorsBad.length}/${anchors.length}`,
    failExtra: anchorsBad.map(describeElement),
  });

  // e. no duplicate id attributes
  const idMap = new Map();
  for (const el of doc.querySelectorAll('[id]')) {
    const id = el.getAttribute('id');
    if (!idMap.has(id)) idMap.set(id, []);
    idMap.get(id).push(el.tagName.toLowerCase());
  }
  const dupIds = [...idMap.entries()].filter(([, tags]) => tags.length > 1);
  results.push({
    label: 'duplicate id',
    code: 'DUPLICATE_ID',
    ok: dupIds.length === 0,
    detail: dupIds.length === 0 ? 'none' : `${dupIds.length} dup`,
    failExtra: dupIds.map(([id, tags]) => `id="${id}" on ${tags.join(', ')}`),
  });

  // f, g. JSON-LD blocks parse, and each has @context + @type
  const jsonLdScripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  const sourceLines = jsonLdSourceLines(html);
  const parseFailures = [];
  const typeFailures = [];
  for (let i = 0; i < jsonLdScripts.length; i++) {
    const body = jsonLdScripts[i].textContent || '';
    const line = sourceLines[i];
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (err) {
      parseFailures.push({ idx: i + 1, line, detail: err.message });
      continue;
    }
    const blocks = Array.isArray(parsed) ? parsed : [parsed];
    for (let j = 0; j < blocks.length; j++) {
      const b = blocks[j];
      const idxLabel = blocks.length === 1 ? `#${i + 1}` : `#${i + 1}.${j + 1}`;
      const missing = [];
      if (!b || typeof b !== 'object' || !b['@context']) missing.push('@context');
      if (!b || typeof b !== 'object' || !b['@type']) missing.push('@type');
      if (missing.length) typeFailures.push({ idx: idxLabel, line, missing: missing.join(', ') });
    }
  }
  const total = jsonLdScripts.length;
  const parsedCount = total - parseFailures.length;
  results.push({
    label: 'json-ld parse',
    code: 'INVALID_JSON_LD',
    ok: parseFailures.length === 0,
    detail: `${parsedCount}/${total}`,
    failExtra: parseFailures.map(f => `block #${f.idx} line ~${f.line}: ${f.detail}`),
  });
  results.push({
    label: 'json-ld @context/@type',
    code: 'JSONLD_MISSING_TYPE',
    ok: typeFailures.length === 0,
    detail: `${parsedCount - typeFailures.length}/${parsedCount}`,
    failExtra: typeFailures.map(f => `block ${f.idx} line ~${f.line}: missing ${f.missing}`),
  });

  // h. <a target="_blank"> carries rel containing both noreferrer and noopener
  const blankAnchors = [...doc.querySelectorAll('a[target="_blank"]')];
  const blankBad = blankAnchors.filter(a => {
    const rel = (a.getAttribute('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    return !(rel.includes('noreferrer') && rel.includes('noopener'));
  });
  results.push({
    label: 'target=_blank rel',
    code: 'BLANK_REL_MISSING',
    ok: blankBad.length === 0,
    detail: `${blankAnchors.length - blankBad.length}/${blankAnchors.length}`,
    failExtra: blankBad.map(a => {
      const href = (a.getAttribute('href') || '').slice(0, 60);
      const rel = a.getAttribute('rel') || '(none)';
      return `<a target="_blank" href="${href}"> rel="${rel}"`;
    }),
  });

  // i. skip-to-content link is the first focusable element in <body>
  if (opts.requireSkipLink) {
    const focusable = doc.body.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
    const isSkip =
      !!focusable &&
      focusable.tagName === 'A' &&
      focusable.classList.contains('skip-to-main');
    results.push({
      label: 'skip link first',
      code: 'SKIP_LINK_NOT_FIRST',
      ok: isSkip,
      detail: isSkip
        ? 'present'
        : focusable
        ? `first focusable: ${describeElement(focusable)}`
        : 'no focusable element in <body>',
    });
  }

  return results;
}

// Same CLS guard, applied statically to <img> tags rendered from
// script.js template literals. Match each `<img …>` substring and
// require a width+height pair OR an aspect-ratio style — the rendered
// HTML is what the browser sees, even if it's stitched together at
// runtime.
function checkScriptImgDimensions(file, source) {
  const failures = [];
  const tagRe = /<img\b[^>]*>/g;
  let m;
  while ((m = tagRe.exec(source)) !== null) {
    const tag = m[0];
    const line = source.slice(0, m.index).split('\n').length;
    const srcMatch = tag.match(/\bsrc\s*=\s*"([^"]*)"/) || tag.match(/\bsrc\s*=\s*'([^']*)'/);
    const src = srcMatch ? srcMatch[1] : '';
    if (/\.svg(?:$|[?#])/i.test(src)) continue;
    const hasW = /\bwidth\s*=/i.test(tag);
    const hasH = /\bheight\s*=/i.test(tag);
    const hasAspect = /aspect-ratio\s*:/i.test(tag);
    if ((hasW && hasH) || hasAspect) continue;
    failures.push({ src, line });
  }
  return [{
    file,
    label: 'img dimensions',
    code: 'IMG_DIM_MISSING',
    ok: failures.length === 0,
    detail: failures.length === 0 ? 'all <img> templates ok' : `${failures.length} template(s) missing dim`,
    failExtra: failures.map(b => `line ~${b.line} src="${b.src}"`),
  }];
}

// ---------- run ----------

const allRows = [];
for (const t of TARGETS) {
  const html = await readFile(join(projectRoot, t.file), 'utf8');
  for (const r of checksFor(html, t)) allRows.push({ file: t.file, ...r });
}

const scriptJs = await readFile(join(projectRoot, 'script.js'), 'utf8');
for (const r of checkScriptImgDimensions('script.js', scriptJs)) allRows.push(r);

const fileWidth = Math.max(...allRows.map(r => r.file.length));
const labelWidth = Math.max(...allRows.map(r => r.label.length));

let failed = 0;
for (const r of allRows) {
  const status = r.ok ? 'ok' : 'FAIL';
  if (!r.ok) failed++;
  console.log(
    `${status.padEnd(4)}  ${r.file.padEnd(fileWidth)}  ${r.label.padEnd(labelWidth)}  ${r.detail}`
  );
}

const fails = allRows.filter(r => !r.ok);
if (fails.length) {
  const codeWidth = Math.max(...fails.map(r => r.code.length), 4);
  console.log('');
  console.log(`        ${'CODE'.padEnd(codeWidth)}  DETAIL`);
  for (const r of fails) {
    const head = `${r.file}  ${r.label}`;
    if (r.failExtra && r.failExtra.length) {
      for (const x of r.failExtra) {
        console.log(`        ${r.code.padEnd(codeWidth)}  ${head} — ${x}`);
      }
    } else {
      console.log(`        ${r.code.padEnd(codeWidth)}  ${head} — ${r.detail}`);
    }
  }
}

const fileCount = new Set(allRows.map(r => r.file)).size;
console.log(
  `\n${fileCount} files · ${allRows.length} checks · ${failed} failed`
);

if (failed) {
  console.error(
    '\nHTML / JSON-LD correctness check failed. See FAIL rows above for the ' +
      'offending code and where to look in the source.'
  );
  process.exit(1);
}
