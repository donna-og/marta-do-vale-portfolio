#!/usr/bin/env node
//
// Sitemap freshness guard. Run as part of `npm test`.
//
// Mirrors `build-sitemap.mjs` in-memory and compares the computed
// per-URL lastmod against what's checked into sitemap.xml. Fails on
// drift in either direction beyond a 7-day skew:
//
//   - "stale": in-repo lastmod lags the source file's git mtime by
//     more than a week. Google reads stale lastmod as the file
//     genuinely not having changed; if it has, the sitemap loses
//     trust and Google falls back to its own crawl heuristics.
//
//   - "future": in-repo lastmod is *ahead* of the source file's git
//     mtime by more than a week. That means someone hand-edited a
//     date forward without a real change — also a trust signal
//     Google penalises, and a sign the dates are no longer derived
//     from actual edits.
//
// 7-day skew tolerance: drift below a week is usually contributor
// lag (PR opened Monday, merged Friday) or harmless rounding — not
// a freshness signal. Drift above a week starts to *be* the signal
// search engines read. The window stays inside the deploy-time
// regen guarantee (build-sitemap.mjs stamps fresh dates on every
// deploy, so the staged artefact is always within ~hours of git).
// Don't widen past 14 days without good reason; if the project is
// idle longer than that, the dates *should* go stale and this
// guard *should* flag.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeAllLastmods, URL_SOURCES } from './build-sitemap.mjs';

const SKEW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const SKEW_MS = SKEW_DAYS * DAY_MS;

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

function parseSitemapLastmods(xml) {
  const out = {};
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const locM = m[1].match(/<loc>([^<]+)<\/loc>/);
    const lmM = m[1].match(/<lastmod>([^<]+)<\/lastmod>/);
    if (locM && lmM) out[locM[1].trim()] = lmM[1].trim();
  }
  return out;
}

const xml = await readFile(join(projectRoot, 'sitemap.xml'), 'utf8');
const actual = parseSitemapLastmods(xml);
const expected = await computeAllLastmods();

const drift = [];
const missing = [];
for (const loc of Object.keys(URL_SOURCES)) {
  const have = actual[loc];
  const want = expected[loc];
  if (!have) { missing.push({ loc, want }); continue; }
  const diffMs = Date.parse(want) - Date.parse(have);
  if (Math.abs(diffMs) > SKEW_MS) {
    const days = Math.round(diffMs / DAY_MS);
    drift.push({ loc, have, want, kind: diffMs > 0 ? 'stale' : 'future', days });
  }
}

const orphaned = Object.keys(actual).filter(loc => !(loc in URL_SOURCES));

const total = Object.keys(URL_SOURCES).length;
const fails = drift.length + missing.length + orphaned.length;
const status = fails === 0 ? 'ok' : 'FAIL';
console.log(`${status.padEnd(4)}  sitemap freshness (skew ≤ ${SKEW_DAYS}d)             ${String(fails).padStart(3)} / ${total}`);

if (fails === 0) process.exit(0);

if (drift.length) {
  console.log('\nFAIL  sitemap <lastmod> drift (>7 days):');
  console.log(`        ${'KIND'.padEnd(7)}  ${'CURRENT'.padEnd(12)}  ${'EXPECTED'.padEnd(12)}  ${'DIFF'.padEnd(8)}  LOC`);
  for (const f of drift) {
    const diff = `${f.days >= 0 ? '+' : ''}${f.days}d`;
    console.log(`        ${f.kind.padEnd(7)}  ${f.have.padEnd(12)}  ${f.want.padEnd(12)}  ${diff.padEnd(8)}  ${f.loc}`);
  }
}

if (missing.length) {
  console.log('\nFAIL  URLs in URL_SOURCES not present in sitemap.xml:');
  for (const m of missing) console.log(`        ${m.loc}  (expected lastmod ${m.want})`);
}

if (orphaned.length) {
  console.log('\nFAIL  URLs in sitemap.xml not mapped in scripts/build-sitemap.mjs:');
  for (const loc of orphaned) console.log(`        ${loc}`);
}

console.error(
  '\nRun `node scripts/build-sitemap.mjs` to regenerate sitemap.xml from git, ' +
  'or update the URL_SOURCES mapping in scripts/build-sitemap.mjs.'
);
process.exit(1);
