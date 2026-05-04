#!/usr/bin/env node
//
// Films / VideoObject / sitemap drift guard. Run as part of `npm test`.
//
// The commercial reel exists in three places that have to agree: the
// `films` array in script.js (rendered into #film-grid at runtime),
// the "Selected commercial work — Marta do Vale" VideoObject ItemList
// in index.html (read by search engines), and the commercial poster
// <image:image> entries in sitemap.xml. A new spot shipping with the
// wrong embedUrl in JSON-LD or a stale poster path in sitemap.xml is
// exactly the kind of drift this guard catches loud at build time.
//
// Pure Node stdlib — no deps. Hard-fail categories: count mismatch
// across the three files, missing or orphaned URL entries on either
// side, missing optimized poster file on disk. Soft-warn: per-entry
// thumbnailUrl divergence between films array and JSON-LD.

import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://www.martadovale.pt/';
const POSTER_PREFIX = `${SITE}assets/posters/optimized/`;
const COMMERCIAL_LIST_NAME = 'Selected commercial work — Marta do Vale';

function extractFilmsArray(source) {
  const anchor = source.indexOf('const films = [');
  if (anchor === -1) throw new Error('could not find `const films = [` in script.js');
  const start = source.indexOf('[', anchor);
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('unterminated `films` array literal in script.js');
}

function parseFilmEntries(arrayLiteral) {
  const entries = [];
  let depth = 0, entryStart = -1;
  for (let i = 0; i < arrayLiteral.length; i++) {
    const ch = arrayLiteral[i];
    if (ch === '{') { if (depth === 0) entryStart = i; depth++; }
    else if (ch === '}' && --depth === 0) {
      const fields = {};
      for (const m of arrayLiteral.slice(entryStart, i + 1).matchAll(/(\w+)\s*:\s*'([^']*)'/g)) fields[m[1]] = m[2];
      entries.push(fields);
    }
  }
  return entries;
}

// Mirrors the regex used by `posterSources` in script.js so the check
// models the same original → optimized transform the runtime renders.
function deriveOptimizedPosterLoc(originalPath) {
  const m = originalPath.match(/^assets\/posters\/(.+)\.jpe?g$/i);
  if (!m) throw new Error(`films poster path does not match assets/posters/...jpg: ${originalPath}`);
  return `${POSTER_PREFIX}${m[1]}-800.jpg`;
}

function deriveExpected(film) {
  const expected = {
    thumbnailUrl: `${SITE}${film.poster}`,
    sitemapImageLoc: deriveOptimizedPosterLoc(film.poster)
  };
  if (film.kind === 'youtube') {
    expected.embedUrl = `https://www.youtube-nocookie.com/embed/${film.videoId}`;
    expected.contentUrl = `https://www.youtube.com/watch?v=${film.videoId}`;
  } else if (film.kind === 'vimeo') {
    expected.embedUrl = `https://player.vimeo.com/video/${film.videoId}`;
    expected.contentUrl = `https://vimeo.com/${film.videoId}`;
  } else if (film.kind === 'mp4') {
    expected.contentUrl = film.videoSrc;
  } else {
    throw new Error(`unknown film kind: ${film.kind}`);
  }
  return expected;
}

function extractCommercialItemList(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script\s+type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g)) {
    try { blocks.push(JSON.parse(m[1])); } catch { /* skip non-JSON */ }
  }
  const list = blocks.find(b => b && b.name === COMMERCIAL_LIST_NAME);
  if (!list) throw new Error(`JSON-LD block named "${COMMERCIAL_LIST_NAME}" not found in index.html`);
  return list.itemListElement.map(el => el.item);
}

function extractCommercialSitemapImages(xml) {
  const out = [];
  for (const m of xml.matchAll(/<image:image>([\s\S]*?)<\/image:image>/g)) {
    const locM = m[1].match(/<image:loc>([^<]+)<\/image:loc>/);
    if (!locM) continue;
    const loc = locM[1].trim();
    if (!loc.startsWith(POSTER_PREFIX)) continue;
    const titleM = m[1].match(/<image:title>([^<]+)<\/image:title>/);
    out.push({ loc, title: titleM ? titleM[1].trim() : '' });
  }
  return out;
}

const sortedDiff = (a, b) => [...a].filter(k => !b.has(k)).sort();
async function fileExists(absPath) { try { await access(absPath); return true; } catch { return false; } }

const scriptJs = await readFile(join(projectRoot, 'script.js'), 'utf8');
const indexHtml = await readFile(join(projectRoot, 'index.html'), 'utf8');
const sitemapXml = await readFile(join(projectRoot, 'sitemap.xml'), 'utf8');

const films = parseFilmEntries(extractFilmsArray(scriptJs));
const jsonld = extractCommercialItemList(indexHtml);
const sitemap = extractCommercialSitemapImages(sitemapXml);
const expected = films.map(deriveExpected);

const filmUrls = new Set();
for (const e of expected) {
  if (e.embedUrl) filmUrls.add(e.embedUrl);
  if (e.contentUrl) filmUrls.add(e.contentUrl);
}
const jsonldUrls = new Set();
for (const item of jsonld) {
  if (item.embedUrl) jsonldUrls.add(item.embedUrl);
  if (item.contentUrl) jsonldUrls.add(item.contentUrl);
}
const filmLocs = new Set(expected.map(e => e.sitemapImageLoc));
const sitemapLocs = new Set(sitemap.map(s => s.loc));

const missingFiles = [];
for (const loc of sitemapLocs) {
  const rel = loc.slice(SITE.length);
  if (!await fileExists(join(projectRoot, rel))) missingFiles.push(loc);
}
missingFiles.sort();

const thumbMismatches = [];
for (let i = 0; i < Math.min(films.length, jsonld.length); i++) {
  if (expected[i].thumbnailUrl !== jsonld[i].thumbnailUrl) {
    thumbMismatches.push(`#${i + 1}  films=${expected[i].thumbnailUrl}  jsonld=${jsonld[i].thumbnailUrl}`);
  }
}

const countMismatch = (label, a, b) => a === b ? [] : [`${label}: films=${a} other=${b}`];

const categories = [
  { label: 'films / JSON-LD count match',              list: countMismatch('count', films.length, jsonld.length),   hard: true },
  { label: 'films / sitemap count match',              list: countMismatch('count', films.length, sitemap.length),  hard: true },
  { label: 'films URLs missing from JSON-LD',          list: sortedDiff(filmUrls, jsonldUrls),                       hard: true },
  { label: 'JSON-LD URLs orphaned (not in films)',     list: sortedDiff(jsonldUrls, filmUrls),                       hard: true },
  { label: 'films posters missing from sitemap',       list: sortedDiff(filmLocs, sitemapLocs),                      hard: true },
  { label: 'sitemap posters orphaned (not in films)',  list: sortedDiff(sitemapLocs, filmLocs),                      hard: true },
  { label: 'sitemap posters missing on disk',          list: missingFiles,                                           hard: true },
  { label: 'thumbnailUrl mismatch (films vs JSON-LD)', list: thumbMismatches,                                        hard: false }
];

let failed = false;
for (const c of categories) {
  const status = c.list.length === 0 ? 'ok' : c.hard ? 'FAIL' : 'warn';
  console.log(`${status.padEnd(4)}  ${c.label.padEnd(45)}  ${String(c.list.length).padStart(3)}`);
  if (c.list.length && c.hard) failed = true;
}

for (const c of categories) {
  if (!c.list.length) continue;
  const tag = c.hard ? 'FAIL' : 'warn';
  console.log(`\n${tag}  ${c.label}:`);
  for (const k of c.list) console.log(`        ${k}`);
}

if (failed) {
  console.error(
    '\nFilms / VideoObject / sitemap drift detected. The films array in ' +
    'script.js, the commercial VideoObject ItemList in index.html, and ' +
    'the commercial <image:image> entries in sitemap.xml must agree.'
  );
  process.exit(1);
}
