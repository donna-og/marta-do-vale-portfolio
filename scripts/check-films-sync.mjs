#!/usr/bin/env node
//
// Films / VideoObject / sitemap drift guard. Run as part of `npm test`.
//
// Two passes share this script.
//
// Commercial reel: the `films` array in script.js (rendered into
// #film-grid at runtime), the "Selected commercial work — Marta do Vale"
// VideoObject ItemList in index.html (read by search engines), and the
// commercial poster <image:image> entries in sitemap.xml must agree. A
// new spot shipping with the wrong embedUrl in JSON-LD or a stale poster
// path in sitemap.xml is exactly the kind of drift this guard catches
// loud at build time.
//
// Cinema reel: the three playable <article class="cinema-card"> blocks
// in index.html, the "Selected cinema credits — Marta do Vale"
// Movie/VideoObject ItemList in index.html, the cinema <image:image>
// entries in sitemap.xml, and the corresponding poster files on disk
// must agree. Lura is intentionally excluded from the sync set — she is
// IMDb-only and carries no data-video-id / trailer.embedUrl. Mutating
// Lura's poster path or sitemap entry does not fail the check.
//
// Pure Node stdlib — no deps. Hard-fail categories: count mismatch
// across files, missing or orphaned URL entries, missing poster file
// on disk, and per-entry title divergence between the films array
// and the JSON-LD VideoObject. Soft-warn (commercial only): per-entry
// thumbnailUrl divergence between films array and JSON-LD.
//
// The title check composes the tile's display name as
// `films[i].title + (subtitle ? ' — ' + subtitle : '')` and compares it
// to the corresponding JSON-LD `name`. Both sides are normalized by
// uppercasing, stripping diacritics (NFD + combining-mark removal),
// folding the multiplication sign × onto the letter X (typographic
// equivalence), and collapsing whitespace. The rule catches
// brand-name typos and word-boundary drift (e.g. BURGUER vs Burger,
// GOLDENERGY vs Gold Energy) without forcing the films array to
// mirror the JSON-LD's exact case or accent style.
//
// Festival metadata (Movie.subjectOf, Movie.award) lives only on the
// JSON-LD side — the cinema cards in index.html and the films array in
// script.js do not carry festival selections or awards. This script
// therefore treats the JSON-LD as the source of truth for those fields
// and intentionally does not compare them across surfaces. A future
// contributor adding festival data should record it in the cinema
// Movie JSON-LD, not propagate it back into the cards or films array.

import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://www.martadovale.pt/';
const POSTER_PREFIX = `${SITE}assets/posters/optimized/`;
const CINEMA_PREFIX = `${SITE}assets/cinema/`;
const COMMERCIAL_LIST_NAME = 'Selected commercial work — Marta do Vale';
const CINEMA_LIST_NAME = 'Selected cinema credits — Marta do Vale';

// ---------- shared helpers ----------

const sortedDiff = (a, b) => [...a].filter(k => !b.has(k)).sort();
async function fileExists(absPath) { try { await access(absPath); return true; } catch { return false; } }

// Case-, diacritic-, and whitespace-insensitive title normalization.
// Folds the multiplication sign × onto X so the films array's plain X
// (which survives slugify into the deep-link hash) compares equal to
// the typographic × in the JSON-LD display name.
const normalizeTitle = (s) => String(s || '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toUpperCase()
  .replace(/×/g, 'X')
  .replace(/\s+/g, ' ')
  .trim();

function extractJsonLdBlocks(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script\s+type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g)) {
    try { blocks.push(JSON.parse(m[1])); } catch { /* skip non-JSON */ }
  }
  return blocks;
}

function extractSitemapImages(xml, prefix) {
  const out = [];
  for (const m of xml.matchAll(/<image:image>([\s\S]*?)<\/image:image>/g)) {
    const locM = m[1].match(/<image:loc>([^<]+)<\/image:loc>/);
    if (!locM) continue;
    const loc = locM[1].trim();
    if (!loc.startsWith(prefix)) continue;
    const titleM = m[1].match(/<image:title>([^<]+)<\/image:title>/);
    out.push({ loc, title: titleM ? titleM[1].trim() : '' });
  }
  return out;
}

// ---------- commercial pass ----------

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

async function commercialPass(scriptJs, indexHtml, sitemapXml) {
  const films = parseFilmEntries(extractFilmsArray(scriptJs));
  const blocks = extractJsonLdBlocks(indexHtml);
  const list = blocks.find(b => b && b.name === COMMERCIAL_LIST_NAME);
  if (!list) throw new Error(`JSON-LD block named "${COMMERCIAL_LIST_NAME}" not found in index.html`);
  const jsonld = list.itemListElement.map(el => el.item);
  const sitemap = extractSitemapImages(sitemapXml, POSTER_PREFIX);
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

  const titleMismatches = [];
  for (let i = 0; i < Math.min(films.length, jsonld.length); i++) {
    const tile = films[i].title + (films[i].subtitle ? ' — ' + films[i].subtitle : '');
    const name = jsonld[i].name || '';
    if (normalizeTitle(tile) !== normalizeTitle(name)) {
      titleMismatches.push(`#${i + 1}  films=${JSON.stringify(tile)}  jsonld=${JSON.stringify(name)}`);
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
    { label: 'title mismatch (films vs JSON-LD)',        list: titleMismatches,                                        hard: true },
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
  }
  return !failed;
}

// ---------- cinema pass ----------

function extractCinemaCards(html) {
  const cards = [];
  const re = /<article\b[^>]*\bclass="[^"]*\bcinema-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const openingTag = m[0].slice(0, m[0].indexOf('>') + 1);
    const body = m[1];
    const kind = (openingTag.match(/data-kind="([^"]+)"/) || [])[1];
    const videoId = (openingTag.match(/data-video-id="([^"]+)"/) || [])[1];
    if (!kind || !videoId) continue;
    const slug = (openingTag.match(/data-film-slug="([^"]+)"/) || [])[1];
    const title = (openingTag.match(/data-film-title="([^"]+)"/) || [])[1];
    const stillKey = (body.match(/film-still--([\w-]+)/) || [])[1];
    cards.push({ kind, videoId, slug, title, stillKey });
  }
  return cards;
}

function parseFilmStillUrls(css) {
  const map = {};
  const re = /\.film-still--([\w-]+)\s*\{[\s\S]*?background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
  let m;
  while ((m = re.exec(css)) !== null) map[m[1]] = m[2];
  return map;
}

function expectedEmbedUrl(kind, videoId) {
  if (kind === 'youtube') return `https://www.youtube-nocookie.com/embed/${videoId}`;
  if (kind === 'vimeo') return `https://player.vimeo.com/video/${videoId}`;
  return null;
}

async function cinemaPass(indexHtml, sitemapXml, srcCss) {
  console.log('\n== Cinema reel ==');

  const cards = extractCinemaCards(indexHtml);
  const blocks = extractJsonLdBlocks(indexHtml);
  const list = blocks.find(b => b && b.name === CINEMA_LIST_NAME);
  if (!list) throw new Error(`JSON-LD block named "${CINEMA_LIST_NAME}" not found in index.html`);
  // Lura has no trailer.embedUrl — exclude her from the sync set, mirroring
  // the cinema-card filter (only cards with data-video-id are scoped).
  const jsonld = list.itemListElement
    .map(el => el.item)
    .filter(item => item && item.trailer && item.trailer.embedUrl);
  const sitemap = extractSitemapImages(sitemapXml, CINEMA_PREFIX);
  const cssMap = parseFilmStillUrls(srcCss);

  const expected = cards.map(c => ({
    ...c,
    embedUrl: expectedEmbedUrl(c.kind, c.videoId),
    posterLoc: c.stillKey && cssMap[c.stillKey] ? `${SITE}${cssMap[c.stillKey]}` : null
  }));

  const errors = [];

  if (cards.length !== jsonld.length) {
    errors.push({ code: 'COUNT', detail: `cards=${cards.length} jsonld=${jsonld.length}` });
  }

  const jsonldEmbedUrls = new Set(jsonld.map(j => j.trailer.embedUrl));
  for (const e of expected) {
    if (!e.embedUrl) {
      errors.push({ code: 'EMBED_URL', detail: `${e.slug}: unknown data-kind="${e.kind}"` });
    } else if (!jsonldEmbedUrls.has(e.embedUrl)) {
      errors.push({ code: 'EMBED_URL', detail: `${e.slug}: card embedUrl=${e.embedUrl} not in JSON-LD` });
    }
  }

  const sitemapLocs = new Set(sitemap.map(s => s.loc));
  for (const e of expected) {
    if (!e.stillKey) {
      errors.push({ code: 'THUMBNAIL', detail: `${e.slug}: card has no .film-still--* modifier class` });
    } else if (!cssMap[e.stillKey]) {
      errors.push({ code: 'THUMBNAIL', detail: `${e.slug}: no .film-still--${e.stillKey} CSS rule in src/input.css` });
    } else if (!sitemapLocs.has(e.posterLoc)) {
      errors.push({ code: 'THUMBNAIL', detail: `${e.slug}: card poster=${e.posterLoc} not in sitemap` });
    }
  }

  for (const e of expected) {
    if (!e.posterLoc) continue;
    const rel = e.posterLoc.slice(SITE.length);
    if (!await fileExists(join(projectRoot, rel))) {
      errors.push({ code: 'MISSING_POSTER', detail: `${e.slug}: ${e.posterLoc} not found on disk` });
    }
  }

  const checks = [
    { label: 'cards / JSON-LD count match',          codes: ['COUNT'] },
    { label: 'cards embedUrl present in JSON-LD',    codes: ['EMBED_URL'] },
    { label: 'cards posters present in sitemap',     codes: ['THUMBNAIL'] },
    { label: 'sitemap posters exist on disk',        codes: ['MISSING_POSTER'] }
  ];

  for (const c of checks) {
    const hits = errors.filter(e => c.codes.includes(e.code)).length;
    const status = hits === 0 ? 'ok' : 'FAIL';
    console.log(`${status.padEnd(4)}  ${c.label.padEnd(45)}  ${String(hits).padStart(3)}`);
  }

  if (errors.length === 0) {
    console.log(`${cards.length} cinema entries · all surfaces aligned`);
    return true;
  }

  const codeWidth = Math.max(...errors.map(e => e.code.length), 4);
  console.log('\nFAIL  cinema reel drift:');
  console.log(`        ${'CODE'.padEnd(codeWidth)}  DETAIL`);
  for (const e of errors) {
    console.log(`        ${e.code.padEnd(codeWidth)}  ${e.detail}`);
  }
  console.error(
    '\nCinema reel drift detected. Cinema cards in index.html, the cinema ' +
    'Movie/VideoObject ItemList in index.html, and the cinema <image:image> ' +
    'entries in sitemap.xml must agree.'
  );
  return false;
}

// ---------- run ----------

const scriptJs = await readFile(join(projectRoot, 'script.js'), 'utf8');
const indexHtml = await readFile(join(projectRoot, 'index.html'), 'utf8');
const sitemapXml = await readFile(join(projectRoot, 'sitemap.xml'), 'utf8');
const srcCss = await readFile(join(projectRoot, 'src/input.css'), 'utf8');

const okCommercial = await commercialPass(scriptJs, indexHtml, sitemapXml);
const okCinema = await cinemaPass(indexHtml, sitemapXml, srcCss);

if (!okCommercial || !okCinema) process.exit(1);
