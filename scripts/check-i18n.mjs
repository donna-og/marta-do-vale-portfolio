#!/usr/bin/env node
//
// i18n drift guard. Run as part of `npm test`.
//
// Extracts every `data-i18n` and `data-i18n-attr` key from the site's
// HTML, parses the EN and PT dictionaries from src/i18n.js, and exits
// non-zero when any key referenced in HTML is missing from EN or PT, or
// when EN and PT have drifted out of sync. The site renders the raw key
// string when a translation is missing, so a missed PT entry ships an
// English fragment to a Portuguese visitor — loud at build time beats
// silent in production.
//
// Pure Node stdlib — no deps. Hard-fail categories: missing EN, missing
// PT, orphan EN, orphan PT. Unused keys are reported as a warning only,
// since some translated strings are referenced from JS (e.g.
// film.tile.playPrefix) or staged for an upcoming feature.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const htmlSources = ['index.html', '404.html'];

function extractHtmlKeys(html) {
  const keys = new Set();
  for (const m of html.matchAll(/\bdata-i18n="([^"]+)"/g)) {
    const key = m[1].trim();
    if (key) keys.add(key);
  }
  for (const m of html.matchAll(/\bdata-i18n-attr="([^"]+)"/g)) {
    for (const pair of m[1].split(',')) {
      const idx = pair.indexOf(':');
      if (idx === -1) continue;
      const key = pair.slice(idx + 1).trim();
      if (key) keys.add(key);
    }
  }
  return keys;
}

function extractDictBlock(source, name) {
  const opener = new RegExp('\\b' + name + '\\s*:\\s*\\{', 'g');
  const m = opener.exec(source);
  if (!m) throw new Error(`could not find "${name}:" opener in src/i18n.js`);
  const start = m.index + m[0].length;
  let depth = 1;
  let i = start;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) return source.slice(start, i);
    i++;
  }
  throw new Error(`unterminated "${name}:" block in src/i18n.js`);
}

function extractDictKeys(block) {
  const keys = new Set();
  for (const m of block.matchAll(/'([^']+)'\s*:/g)) keys.add(m[1]);
  return keys;
}

const sortedDiff = (a, b) => [...a].filter(k => !b.has(k)).sort();

const htmlKeys = new Set();
for (const file of htmlSources) {
  const text = await readFile(join(projectRoot, file), 'utf8');
  for (const key of extractHtmlKeys(text)) htmlKeys.add(key);
}

const dictSource = await readFile(join(projectRoot, 'src/i18n.js'), 'utf8');
const enKeys = extractDictKeys(extractDictBlock(dictSource, 'en'));
const ptKeys = extractDictKeys(extractDictBlock(dictSource, 'pt'));

const translated = new Set([...enKeys].filter(k => ptKeys.has(k)));

const categories = [
  { label: 'HTML keys missing from EN', list: sortedDiff(htmlKeys, enKeys), hard: true },
  { label: 'HTML keys missing from PT', list: sortedDiff(htmlKeys, ptKeys), hard: true },
  { label: 'EN keys with no PT match',  list: sortedDiff(enKeys, ptKeys),   hard: true },
  { label: 'PT keys with no EN match',  list: sortedDiff(ptKeys, enKeys),   hard: true },
  { label: 'Translated keys unused in HTML', list: sortedDiff(translated, htmlKeys), hard: false }
];

let failed = false;
for (const c of categories) {
  const status = c.list.length === 0 ? 'ok' : c.hard ? 'FAIL' : 'warn';
  console.log(
    `${status.padEnd(4)}  ${c.label.padEnd(36)}  ${String(c.list.length).padStart(3)}`
  );
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
    '\ni18n drift detected. Add the missing key(s) to src/i18n.js (both ' +
    'EN and PT dictionaries) before merging. The site renders the raw ' +
    'key string when a translation is missing.'
  );
  process.exit(1);
}
