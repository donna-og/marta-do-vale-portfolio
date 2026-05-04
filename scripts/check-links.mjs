#!/usr/bin/env node
//
// External link rot guard. Runs on a weekly cron in
// .github/workflows/links.yml — not part of `npm test`, so PR CI
// doesn't gate on third-party network state.
//
// Surface scanned:
//   - Every `videoId` / `videoSrc` in the `films` array of script.js
//     (commercial reel). YouTube ids are checked via the oEmbed
//     endpoint, which 404s for removed videos (the embed URL
//     returns 200 even after a takedown). Wix mp4s are checked
//     with HEAD.
//   - Every cinema-card `data-video-id` in index.html (YouTube +
//     Vimeo) via the respective oEmbed endpoint.
//   - Every `<a href="https://...">` in index.html whose host is
//     not a video CDN we already cover above and is not the
//     same-origin canonical / hreflang. Includes IMDb (name +
//     per-film), the Leopardo Filmes producer page, and Instagram.
//
// Deliberate skips:
//   - api.whatsapp.com/send — intentional 302 / user-action only.
//   - www.martadovale.pt — same-origin, covered by the deploy.
//
// Pure Node ≥ 20 stdlib. No new deps.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// Hosts whose URLs are already probed via oEmbed / HEAD on the
// canonical id, so anchor hrefs pointing at them would be
// duplicate work.
const VIDEO_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'video.wixstatic.com'
]);

const SAME_ORIGIN_HOSTS = new Set([
  'www.martadovale.pt',
  'martadovale.pt'
]);

// 302 by design, gated on a user tap — checker would falsely flag.
const WHATSAPP_PREFIX = 'https://api.whatsapp.com/send';

// Any 2xx counts as healthy — IMDb in particular returns 202 for
// HEAD requests on live title pages (their async / cached path),
// and treating that as a warning would generate a false alarm
// every cron run.
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const isHealthy = (s) => (s >= 200 && s < 300) || REDIRECT_STATUSES.has(s);
const TIMEOUT_MS = 8000;
const CONCURRENCY = 6;
const USER_AGENT =
  'mdv-link-check/1.0 (+https://www.martadovale.pt) Mozilla/5.0 compatible';

// ---------- film array parsing (mirrors check-films-sync.mjs) ----------

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

function extractCinemaCards(html) {
  const cards = [];
  const re = /<article\b[^>]*\bclass="[^"]*\bcinema-card\b[^"]*"[^>]*>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const kind = (tag.match(/data-kind="([^"]+)"/) || [])[1];
    const videoId = (tag.match(/data-video-id="([^"]+)"/) || [])[1];
    const slug = (tag.match(/data-film-slug="([^"]+)"/) || [])[1] || videoId || '?';
    if (!kind || !videoId) continue;
    cards.push({ kind, videoId, slug });
  }
  return cards;
}

function extractAnchorHrefs(html) {
  const out = [];
  const re = /<a\b[^>]*?\bhref="(https:\/\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

// ---------- target collection ----------

function youtubeOembed(videoId) {
  const watch = `https://www.youtube.com/watch?v=${videoId}`;
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`;
}

function vimeoOembed(videoId) {
  const page = `https://vimeo.com/${videoId}`;
  return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(page)}`;
}

function collectTargets({ films, cards, anchors }) {
  const targets = [];

  films.forEach((film, idx) => {
    const source = `films[${idx}]`;
    if (film.kind === 'youtube') {
      targets.push({ url: youtubeOembed(film.videoId), source, method: 'GET' });
    } else if (film.kind === 'vimeo') {
      targets.push({ url: vimeoOembed(film.videoId), source, method: 'GET' });
    } else if (film.kind === 'mp4') {
      targets.push({ url: film.videoSrc, source, method: 'HEAD' });
    } else {
      throw new Error(`unknown film.kind=${film.kind} at ${source}`);
    }
  });

  for (const card of cards) {
    const source = `cinema-card[${card.slug}]`;
    if (card.kind === 'youtube') {
      targets.push({ url: youtubeOembed(card.videoId), source, method: 'GET' });
    } else if (card.kind === 'vimeo') {
      targets.push({ url: vimeoOembed(card.videoId), source, method: 'GET' });
    } else {
      throw new Error(`unknown cinema-card data-kind=${card.kind} at ${source}`);
    }
  }

  for (const href of anchors) {
    let host;
    try { host = new URL(href).host; } catch { continue; }
    if (VIDEO_HOSTS.has(host)) continue;        // covered by oEmbed / HEAD above
    if (SAME_ORIGIN_HOSTS.has(host)) continue;  // deploy-checked, not external
    if (href.startsWith(WHATSAPP_PREFIX)) continue;
    targets.push({ url: href, source: '<a href>', method: 'HEAD' });
  }

  // De-dupe by URL — the noscript fallback list duplicates
  // every commercial trailer, so a pure URL key collapses
  // those without producing a second wave of requests.
  const seen = new Map();
  for (const t of targets) {
    if (!seen.has(t.url)) seen.set(t.url, t);
  }
  return [...seen.values()];
}

// ---------- probing ----------

async function probeOnce(url, method) {
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT, accept: '*/*' }
    });
    return { status: res.status, error: null };
  } catch (err) {
    const name = err && err.name ? err.name : 'Error';
    const msg = err && err.message ? err.message : String(err);
    return { status: 0, error: `${name}: ${msg}` };
  }
}

async function probe(target) {
  let method = target.method;
  let result = await probeOnce(target.url, method);

  // Some hosts (Instagram, certain CDNs) refuse HEAD with 405 / 403.
  // Fall back to GET once before treating it as broken.
  if (method === 'HEAD' && (result.status === 405 || result.status === 403)) {
    method = 'GET';
    result = await probeOnce(target.url, method);
  }

  // One retry on transient failure: network error or 5xx.
  const transient = result.status === 0 || result.status >= 500;
  if (transient) {
    result = await probeOnce(target.url, method);
  }

  return { ...target, method, ...result };
}

async function probeAll(targets) {
  const results = [];
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const chunk = targets.slice(i, i + CONCURRENCY);
    const part = await Promise.all(chunk.map(probe));
    results.push(...part);
  }
  return results;
}

// ---------- classification + output ----------

function classify(result) {
  if (isHealthy(result.status)) return 'ok';
  if (result.status >= 400 && result.status < 500) return 'FAIL';
  // 5xx after retry, or network error / timeout — server-side or
  // runner-side, not a curated dead link. Surface but don't fail.
  return 'WARN';
}

function printTable(results) {
  const rows = results.map(r => ({ ...r, verdict: classify(r) }));
  const codeStr = r => r.status === 0 ? 'ERR' : String(r.status);
  const widthStatus = Math.max('STATUS'.length, ...rows.map(r => r.verdict.length));
  const widthCode = Math.max('CODE'.length, ...rows.map(r => codeStr(r).length));
  const widthSource = Math.max('SOURCE'.length, ...rows.map(r => r.source.length));
  const gap = '  ';

  console.log(
    'STATUS'.padEnd(widthStatus) + gap +
    'CODE'.padEnd(widthCode) + gap +
    'SOURCE'.padEnd(widthSource) + gap +
    'URL'
  );
  for (const r of rows) {
    console.log(
      r.verdict.padEnd(widthStatus) + gap +
      codeStr(r).padEnd(widthCode) + gap +
      r.source.padEnd(widthSource) + gap +
      r.url + (r.error ? `   (${r.error})` : '')
    );
  }

  const ok = rows.filter(r => r.verdict === 'ok').length;
  const warn = rows.filter(r => r.verdict === 'WARN').length;
  const fail = rows.filter(r => r.verdict === 'FAIL').length;
  console.log(
    `\n${rows.length} unique URLs · ${ok} ok · ${warn} warnings · ${fail} broken`
  );
  return fail;
}

// ---------- run ----------

const scriptJs = await readFile(join(projectRoot, 'script.js'), 'utf8');
const indexHtml = await readFile(join(projectRoot, 'index.html'), 'utf8');

const films = parseFilmEntries(extractFilmsArray(scriptJs));
const cards = extractCinemaCards(indexHtml);
const anchors = extractAnchorHrefs(indexHtml);

const targets = collectTargets({ films, cards, anchors });
const results = await probeAll(targets);
const fail = printTable(results);

if (fail > 0) process.exit(1);
