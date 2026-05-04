#!/usr/bin/env node
//
// Preconnect coverage guard. Run as part of `npm test`.
//
// `<link rel="preconnect">` is a *promise* to Chrome that the document
// will open a TLS + DNS round-trip to a specific origin within ~3s of
// paint. Today index.html ships four hand-tuned preconnects —
// www.youtube-nocookie.com, i.ytimg.com, video.wixstatic.com,
// player.vimeo.com — each added when the corresponding origin was
// first referenced. Two failure modes have no guard today:
//
//   • Drift on add — a future contributor introduces a new
//     cross-origin host (e.g., a fresh Wix MP4 on a different
//     `*.wixstatic.com` subdomain, or an `i.vimeocdn.com` poster
//     that the page actually fetches) without adding the matching
//     preconnect. The site still works, but the user pays a
//     200-300 ms TLS hiccup before the modal video starts and the
//     Lighthouse "Avoid multiple, costly round trips" audit
//     silently regresses.
//   • Drift on remove — the last reference to a preconnected
//     origin disappears (e.g., a Wix MP4 is re-encoded and
//     self-hosted) but the preconnect line stays behind. Chrome
//     opens a TLS handshake to a host the page never uses,
//     contending for hot-path resources — the inverse Lighthouse
//     audit, "Preconnect to required origins", flips negative.
//
// This is the conceptual sibling of scripts/check-preload-coherence.mjs
// (task 0048): both audit a `<head>` performance hint against the
// document's actual fetch surface and fail loud if drift is
// detected. Same "no silent regressions" stance as the byte budget
// (0023), the i18n keys guard (0029), the films/sitemap drift
// guard (0032 / 0035), the CLS / image-dimensions guard (0042),
// the AVIF/WebP companion guard (0043), the axe accessibility
// floor (0046), and the sitemap freshness check (0047).
//
// What counts as a "referenced" cross-origin host:
//   1. Static DOM attributes that the browser fetches at load /
//      runtime: `iframe[src]`, `source[src|srcset]`,
//      `img[src|srcset]`, `video[src]`, `picture > source[srcset]`,
//      `link[href]` (excluding rel=preconnect / preload /
//      dns-prefetch — those *are* the hint we audit).
//   2. Inline `style="…url(…)…"` attributes and `<style>` blocks.
//   3. Open Graph / Twitter player meta values (og:image,
//      og:video, og:video:url, og:video:secure_url, twitter:image,
//      twitter:player) — link unfurlers fetch these and any
//      preview tile relies on the same TLS round-trip.
//   4. URL literals in inline `<script>` blocks (excluding
//      JSON-LD) and in the linked external script.js — these
//      become iframe.src / video.src on click and amortise the
//      same handshake. A regex is sufficient here: jsdom does not
//      execute the click handlers and we want to flag drift the
//      moment the literal lands in source, not the moment a user
//      clicks a tile.
//   5. JSON-LD image fields (`thumbnailUrl`, `image`, `logo`).
//      These are URLs that the page itself displays as image
//      content (or would, on the relevant surfaces). Other
//      JSON-LD URL fields (`url`, `sameAs`, `contentUrl`,
//      `embedUrl`, `@context`) are declarations Google reads but
//      the page does not fetch — those are intentionally NOT in
//      the referenced set (they live in <a href> or are read by
//      crawlers, not by the runtime page).
//
// `<a href>` is intentionally NOT scanned. User-initiated tab
// navigation does not benefit from a parent-page preconnect — the
// new tab opens its own connection.
//
// IGNORED_ORIGINS below is the allowlist for legitimate
// exceptions (e.g., a JSON-LD thumbnailUrl the page itself never
// renders as an `<img>`). Each entry must include the date added
// and the reason the origin is referenced but should not have a
// runtime preconnect. Same allowlist discipline as
// SKIPPED_RULES in check-a11y, ALLOWLIST_PREFIXES in
// check-image-variants, and SKIPPED in check-csp-hashes.
//
// Pure Node stdlib + jsdom (already a dep). No script execution —
// jsdom is used for HTML parsing only, the same way
// check-preload-coherence consumes the document.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const SAME_ORIGIN_HOSTS = new Set([
  'martadovale.pt',
  'www.martadovale.pt',
]);

// Allowlist of cross-origin hosts the page references but should
// NOT carry a `<link rel="preconnect">`. Format: scheme://host
// (lowercase, no trailing slash, port included only if non-default).
//
// Each entry must justify *why* the origin is referenced without
// being fetched on page load. A future contributor reading this
// file should be able to decide whether the exemption still holds
// without re-deriving the reasoning from scratch.
const IGNORED_ORIGINS = new Set([
  // JSON-LD `thumbnailUrl` only — the cinema-card poster for
  // "All the Dreams in the World" is a local film still
  // (src/input.css `.film-still--all-the-dreams-in-the-world`),
  // and the Vimeo iframe pulls its own poster from
  // player.vimeo.com after the modal opens. Google reads the
  // thumbnailUrl when crawling the Movie/VideoObject metadata;
  // the runtime page never fetches i.vimeocdn.com. Added 2026-05-04.
  'https://i.vimeocdn.com',
]);

// Paths to the script sources scanned for URL literals. Inline
// scripts inside index.html are pulled out of the DOM
// dynamically; this constant only lists external scripts the
// document loads.
const EXTERNAL_SCRIPT_PATHS = ['script.js', 'motion.js'];

// JSON-LD keys whose string values represent images the page
// itself can display (and therefore would benefit from a
// preconnect if the host is cross-origin). See header for why
// `url`, `sameAs`, `contentUrl`, and `embedUrl` are intentionally
// excluded.
const JSON_LD_IMAGE_KEYS = new Set(['thumbnailUrl', 'image', 'logo']);

const URL_LITERAL_RE = /https?:\/\/[^\s'"`<>{}()\\]+/gi;

// ---------- helpers ----------

function classifyOrigin(rawUrl) {
  if (!rawUrl) return null;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return null;
  // Skip relative paths, data:, mailto:, tel:, whatsapp:, intent: etc.
  if (!/^https?:\/\//i.test(trimmed)) return null;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (SAME_ORIGIN_HOSTS.has(parsed.host.toLowerCase())) return null;
  return parsed.origin.toLowerCase();
}

function parseSrcset(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(/\s+/)[0]);
}

// Strip trailing punctuation a regex match against free-form
// source code can pick up (e.g. `https://example.com/foo.`,
// `…/bar);`).
function trimUrl(url) {
  return url.replace(/[.,;:!?'"`)\]\}]+$/, '');
}

function recordRef(refs, origin, where) {
  if (!origin) return;
  if (!refs.has(origin)) {
    refs.set(origin, { first: where, count: 1 });
  } else {
    refs.get(origin).count++;
  }
}

function walkJsonLdImageFields(value, out, path = '$') {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      walkJsonLdImageFields(value[i], out, `${path}[${i}]`);
    }
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const childPath = `${path}.${key}`;
      if (JSON_LD_IMAGE_KEYS.has(key)) {
        if (typeof child === 'string') {
          out.push({ url: child, path: childPath });
        } else if (Array.isArray(child)) {
          for (let i = 0; i < child.length; i++) {
            if (typeof child[i] === 'string') {
              out.push({ url: child[i], path: `${childPath}[${i}]` });
            } else {
              walkJsonLdImageFields(child[i], out, `${childPath}[${i}]`);
            }
          }
        } else if (child && typeof child === 'object') {
          // Nested ImageObject etc. — recurse, but also pull
          // out a `url` field if present, since that is the
          // image's actual URL.
          if (typeof child.url === 'string') {
            out.push({ url: child.url, path: `${childPath}.url` });
          }
          walkJsonLdImageFields(child, out, childPath);
        }
      } else {
        walkJsonLdImageFields(child, out, childPath);
      }
    }
  }
}

// ---------- collection passes ----------

function collectPreconnects(doc) {
  const map = new Map();
  for (const el of doc.head.querySelectorAll('link[rel~="preconnect"][href]')) {
    const origin = classifyOrigin(el.getAttribute('href'));
    if (!origin) continue;
    if (!map.has(origin)) map.set(origin, el.getAttribute('href'));
  }
  return map;
}

function collectFromDom(doc, refs) {
  // 1. iframe[src]
  for (const el of doc.querySelectorAll('iframe[src]')) {
    recordRef(refs, classifyOrigin(el.getAttribute('src')), 'iframe[src]');
  }
  // 2. video[src], audio[src]
  for (const el of doc.querySelectorAll('video[src], audio[src]')) {
    recordRef(refs, classifyOrigin(el.getAttribute('src')), `${el.tagName.toLowerCase()}[src]`);
  }
  // 3. source[src], source[srcset]
  for (const el of doc.querySelectorAll('source[src]')) {
    recordRef(refs, classifyOrigin(el.getAttribute('src')), 'source[src]');
  }
  for (const el of doc.querySelectorAll('source[srcset]')) {
    for (const u of parseSrcset(el.getAttribute('srcset'))) {
      recordRef(refs, classifyOrigin(u), 'source[srcset]');
    }
  }
  // 4. img[src], img[srcset]
  for (const el of doc.querySelectorAll('img[src]')) {
    recordRef(refs, classifyOrigin(el.getAttribute('src')), 'img[src]');
  }
  for (const el of doc.querySelectorAll('img[srcset]')) {
    for (const u of parseSrcset(el.getAttribute('srcset'))) {
      recordRef(refs, classifyOrigin(u), 'img[srcset]');
    }
  }
  // 5. link[href] — exclude rel preconnect / preload / dns-prefetch.
  for (const el of doc.querySelectorAll('link[href]')) {
    const rel = (el.getAttribute('rel') || '').toLowerCase();
    if (/(?:^|\s)(preconnect|preload|dns-prefetch|modulepreload)(?:\s|$)/.test(rel)) continue;
    recordRef(refs, classifyOrigin(el.getAttribute('href')), `link[rel="${rel || '(none)'}"]`);
  }
  // 6. og:* / twitter:* meta values that resolve to fetched media.
  const META_PROPERTIES = ['og:image', 'og:video', 'og:video:url', 'og:video:secure_url'];
  const META_NAMES = ['twitter:image', 'twitter:player'];
  for (const prop of META_PROPERTIES) {
    for (const el of doc.querySelectorAll(`meta[property="${prop}"]`)) {
      recordRef(refs, classifyOrigin(el.getAttribute('content')), `meta[property="${prop}"]`);
    }
  }
  for (const name of META_NAMES) {
    for (const el of doc.querySelectorAll(`meta[name="${name}"]`)) {
      recordRef(refs, classifyOrigin(el.getAttribute('content')), `meta[name="${name}"]`);
    }
  }
  // 7. inline style="…url(…)…" attributes.
  for (const el of doc.querySelectorAll('[style]')) {
    const style = el.getAttribute('style') || '';
    for (const m of style.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
      recordRef(refs, classifyOrigin(m[1]), 'style="…url(…)…"');
    }
  }
  // 8. <style> blocks.
  for (const el of doc.querySelectorAll('style')) {
    const css = el.textContent || '';
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
      recordRef(refs, classifyOrigin(m[1]), '<style> url(…)');
    }
  }
}

function collectFromJsonLd(doc, refs) {
  const blocks = doc.querySelectorAll('script[type="application/ld+json"]');
  let blockIndex = 0;
  for (const el of blocks) {
    blockIndex++;
    const text = el.textContent || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      continue;
    }
    const found = [];
    walkJsonLdImageFields(parsed, found);
    for (const { url, path } of found) {
      recordRef(refs, classifyOrigin(url), `JSON-LD[${blockIndex}] ${path}`);
    }
  }
}

function collectFromScriptText(text, refs, label) {
  for (const m of text.matchAll(URL_LITERAL_RE)) {
    const cleaned = trimUrl(m[0]);
    recordRef(refs, classifyOrigin(cleaned), label);
  }
}

function collectFromInlineScripts(doc, refs) {
  for (const el of doc.querySelectorAll('script:not([src])')) {
    const type = (el.getAttribute('type') || '').toLowerCase();
    if (type === 'application/ld+json') continue;
    collectFromScriptText(el.textContent || '', refs, 'inline <script>');
  }
}

// ---------- run ----------

const indexHtml = await readFile(join(projectRoot, 'index.html'), 'utf8');
const dom = new JSDOM(indexHtml);
const doc = dom.window.document;

const referenced = new Map();
collectFromDom(doc, referenced);
collectFromJsonLd(doc, referenced);
collectFromInlineScripts(doc, referenced);

for (const path of EXTERNAL_SCRIPT_PATHS) {
  const src = await readFile(join(projectRoot, path), 'utf8');
  collectFromScriptText(src, referenced, `${path} literal`);
}

const preconnects = collectPreconnects(doc);

// Split referenced origins into required-vs-allowlisted.
const required = new Map();
const allowlisted = new Map();
for (const [origin, info] of referenced) {
  if (IGNORED_ORIGINS.has(origin)) {
    allowlisted.set(origin, info);
  } else {
    required.set(origin, info);
  }
}

const fails = [];

// Missing preconnect — referenced (non-ignored) origin without a
// preconnect line.
for (const [origin, info] of required) {
  if (!preconnects.has(origin)) {
    fails.push({
      code: 'MISSING_PRECONNECT',
      detail: `${new URL(origin).host} (first referenced by ${info.first})`,
    });
  }
}

// Stale preconnect — preconnect declared but origin not in the
// referenced set (or only referenced via an allowlisted path).
for (const [origin, href] of preconnects) {
  if (IGNORED_ORIGINS.has(origin)) continue;
  if (!required.has(origin)) {
    fails.push({
      code: 'STALE_PRECONNECT',
      detail: `${new URL(origin).host} — declared (${href}) but not referenced`,
    });
  }
}

const declaredCount = preconnects.size;
const referencedHosts = [...required.keys()]
  .map((origin) => new URL(origin).host)
  .sort();
const allowlistedHosts = [...allowlisted.keys()]
  .map((origin) => new URL(origin).host)
  .sort();

if (fails.length === 0) {
  let line =
    `✓ preconnect-coverage: ${declaredCount} declared, ` +
    `${referencedHosts.length} referenced (${referencedHosts.join(', ')})`;
  if (allowlistedHosts.length) {
    line +=
      `; ${allowlistedHosts.length} origin${allowlistedHosts.length === 1 ? '' : 's'} ` +
      `allowlisted (${allowlistedHosts.join(', ')} — JSON-LD only)`;
  }
  console.log(line);
} else {
  console.log(
    `FAIL preconnect-coverage: ${declaredCount} declared, ` +
      `${referencedHosts.length} referenced; ${fails.length} drift`,
  );
  const codeWidth = Math.max(...fails.map((f) => f.code.length));
  console.log(`        ${'CODE'.padEnd(codeWidth)}  DETAIL`);
  for (const f of fails) {
    console.log(`        ${f.code.padEnd(codeWidth)}  ${f.detail}`);
  }
  console.error(
    '\nPreconnect coverage check failed. Every cross-origin host the page ' +
      'fetches at runtime must have a matching <link rel="preconnect"> in ' +
      '<head>, and every preconnect must still be consumed. Allowlist a ' +
      'JSON-LD-only origin in IGNORED_ORIGINS with a dated reason if the ' +
      'page genuinely never fetches it.',
  );
  process.exit(1);
}
