#!/usr/bin/env node
//
// External link rel/target guard. Run as part of `npm test`.
//
// Every `<a target="_blank">` on the site must carry both
// rel=noopener and rel=noreferrer. Without noopener, the opened tab can
// call `window.opener.location = …` to redirect the original Marta tab
// to a phishing page (tabnabbing — a real, named class of attack).
// Without noreferrer, the third-party site (YouTube, IMDb, Wix) sees
// `martadovale.pt` in its referrer logs, contradicting the
// strict-origin-when-cross-origin posture set by the page's `referrer`
// meta — a deliberate producer-privacy choice.
//
// Today every external link in index.html — the cinema-card IMDb /
// leopardofilmes / festival links, the contact-panel social tiles, and
// the entire 25-item noscript fallback list — carries
// rel="noreferrer noopener". That's only true because each was
// hand-typed correctly. This guard catches the future regression: a
// 31st link added with rel omitted, mistyped (`noopen`, `nooopener`),
// or weakened to `rel="noopener"` only fails the build before merge.
//
// Two passes share this script:
//   1. Static parse (no scripts): default JSDOM = scripting disabled,
//      so `<noscript>` contents are real DOM elements. This is the
//      only way to audit the 25-item video fallback list, since
//      `<noscript>` is tokenized as raw text whenever scripting is
//      enabled at parse time.
//   2. JS-rendered parse (`runScripts: 'dangerously'` + wait for
//      `#film-grid` to populate): catches anchors injected by
//      script.js. The film grid currently renders <button> tiles, so
//      this pass adds zero coverage today; tomorrow it'll catch a
//      contributor who renders an <a target="_blank"> tile with no
//      rel — same machinery as scripts/check-a11y.mjs and
//      scripts/check-films-sync.mjs.
//
// Same "no silent regressions" stance as 0023 (byte budget),
// 0029 (i18n parity), 0032/0035 (films sync), 0042 (image dimensions),
// 0043 (image variants), 0046 (a11y floor), 0047 (sitemap freshness),
// and 0048 (preload coherence).
//
// Bonus pass: any `<a href="http(s)://…">` with no `target` attribute
// pointing at a cross-origin host is surfaced as a warning (not a
// failure). Today there are zero such links. In-tab cross-origin
// navigation is sometimes correct (a deliberate full-context handoff),
// so the build does not fail — but a future contributor sees the
// warning and can confirm intent.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const TARGET_FILE = 'index.html';
const FILM_GRID_TIMEOUT_MS = 5000;
const REQUIRED_REL_TOKENS = ['noopener', 'noreferrer'];
const SAME_ORIGIN_HOSTS = new Set(['martadovale.pt', 'www.martadovale.pt']);

function bootStaticDom(html) {
  // Default JSDOM = scripting disabled at parse time, so `<noscript>`
  // contents become real DOM elements. This is the only pass that
  // sees the 25-item fallback list.
  return new JSDOM(html);
}

async function bootDynamicDom(absPath, html) {
  // Swallow jsdom's noise about APIs it doesn't fully implement
  // (canvas, IntersectionObserver, matchMedia edge cases). None of
  // that is signal for a link-attribute audit; missing-grid is caught
  // by the timeout below.
  const vc = new VirtualConsole();
  const dom = new JSDOM(html, {
    url: pathToFileURL(absPath).href,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') {
      resolve();
    } else {
      dom.window.addEventListener('load', () => resolve(), { once: true });
    }
  });
  const start = Date.now();
  while (Date.now() - start < FILM_GRID_TIMEOUT_MS) {
    const populated = dom.window.document.querySelector(
      '#film-grid [data-film-title], #film-grid [data-film-id]',
    );
    if (populated) return dom;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(
    'check-external-links: #film-grid never populated within ' +
      `${FILM_GRID_TIMEOUT_MS}ms — script.js may have errored before ` +
      'rendering. Run `npm test` after a fresh `npm run build:css` and ' +
      'verify the page in a browser.',
  );
}

function parseRelTokens(a) {
  return new Set(
    (a.getAttribute('rel') || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
  );
}

function describeHref(a) {
  const href = (a.getAttribute('href') || '').trim();
  return href.length > 100 ? `${href.slice(0, 97)}...` : href;
}

function isCrossOriginHttp(rawHref) {
  if (!rawHref) return false;
  const trimmed = String(rawHref).trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  return !SAME_ORIGIN_HOSTS.has(parsed.host.toLowerCase());
}

function auditDom(doc, surface) {
  const blankLinks = [...doc.querySelectorAll('a[target="_blank"]')];
  const failures = [];
  for (const a of blankLinks) {
    const rel = parseRelTokens(a);
    const missing = REQUIRED_REL_TOKENS.filter((tok) => !rel.has(tok));
    if (missing.length) {
      failures.push({
        surface,
        href: describeHref(a),
        rel: a.getAttribute('rel') || '(none)',
        missing,
      });
    }
  }

  const inTabExternal = [];
  for (const a of doc.querySelectorAll('a[href]')) {
    if (a.hasAttribute('target')) continue;
    const href = a.getAttribute('href') || '';
    if (!isCrossOriginHttp(href)) continue;
    inTabExternal.push({ surface, href: describeHref(a) });
  }

  return { surface, blankCount: blankLinks.length, failures, inTabExternal };
}

// ---------- run ----------

const absPath = join(projectRoot, TARGET_FILE);
const html = await readFile(absPath, 'utf8');

const staticDom = bootStaticDom(html);
const dynamicDom = await bootDynamicDom(absPath, html);

const reports = [
  auditDom(staticDom.window.document, 'static'),
  auditDom(dynamicDom.window.document, 'JS-rendered'),
];

dynamicDom.window.close();

const allFailures = reports.flatMap((r) => r.failures);
const allInTabExternal = reports.flatMap((r) => r.inTabExternal);

// Same href can appear in both passes — collapse for the warning list.
const seenInTabHrefs = new Set();
const uniqueInTabExternal = allInTabExternal.filter((w) => {
  if (seenInTabHrefs.has(w.href)) return false;
  seenInTabHrefs.add(w.href);
  return true;
});

const surfaceWidth = Math.max(...reports.map((r) => r.surface.length));
for (const r of reports) {
  const status = r.failures.length === 0 ? 'ok' : 'FAIL';
  console.log(
    `${status.padEnd(4)}  ${r.surface.padEnd(surfaceWidth)}  ` +
      `${String(r.blankCount).padStart(3)} <a target="_blank">  ` +
      (r.failures.length === 0
        ? 'all rel noopener+noreferrer'
        : `${r.failures.length} missing required rel token(s)`),
  );
}

const staticReport = reports.find((r) => r.surface === 'static');
const dynamicReport = reports.find((r) => r.surface === 'JS-rendered');

if (allFailures.length === 0) {
  console.log(
    `\n✓ external-links: ${staticReport.blankCount} target=_blank links ` +
      `(${dynamicReport.blankCount} also present in JS-rendered DOM), ` +
      'all rel noopener+noreferrer.',
  );
  if (uniqueInTabExternal.length) {
    console.warn(
      `\nwarn  ${uniqueInTabExternal.length} cross-origin <a href> ` +
        'without target="_blank" — verify deliberate in-tab navigation:',
    );
    for (const w of uniqueInTabExternal) {
      console.warn(`        [${w.surface}] ${w.href}`);
    }
  }
  process.exit(0);
}

console.log('');
console.log(`        ${'SURFACE'.padEnd(13)}  ${'MISSING'.padEnd(20)}  HREF`);
for (const f of allFailures) {
  console.log(
    `        ${f.surface.padEnd(13)}  ${f.missing.join('+').padEnd(20)}  ` +
      `${f.href}  (rel="${f.rel}")`,
  );
}

if (uniqueInTabExternal.length) {
  console.warn(
    `\nwarn  ${uniqueInTabExternal.length} cross-origin <a href> without ` +
      'target="_blank" — verify deliberate in-tab navigation:',
  );
  for (const w of uniqueInTabExternal) {
    console.warn(`        [${w.surface}] ${w.href}`);
  }
}

console.error(
  '\nExternal link guard failed. Every <a target="_blank"> must carry ' +
    'rel="noopener noreferrer" — noopener prevents tabnabbing (the opened ' +
    'tab redirecting window.opener), noreferrer preserves the ' +
    'strict-origin-when-cross-origin posture set on this page. Add both ' +
    'tokens to the offending link(s) above.',
);
process.exit(1);
