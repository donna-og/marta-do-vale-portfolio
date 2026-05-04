#!/usr/bin/env node
//
// Sitemap <lastmod> regenerator. Run at deploy time
// (`node scripts/build-sitemap.mjs --out=_site/sitemap.xml`) to stamp each
// URL's <lastmod> from the latest git-commit date of its underlying
// source files. Without --out, rewrites the in-repo sitemap.xml in
// place — useful when you actually want to refresh the committed copy.
//
// `<lastmod>` is the search-engine signal for "this page meaningfully
// changed". Hand-maintained dates rot the moment a contributor edits
// index.html / script.js / i18n strings without remembering to bump the
// sitemap. Deriving each <lastmod> from `git log -1 --format=%cI -- <src>`
// keeps the two synchronised at the deploy boundary, with no human in
// the loop. The companion guard `check-sitemap-freshness.mjs` catches
// in-repo drift in either direction (>7 days behind, or any future date).
//
// Touches only <lastmod> values for URLs listed in URL_SOURCES. The
// hand-authored <image:image> block (task 0018), <changefreq>, <priority>,
// and xhtml:link alternates are preserved byte-for-byte.

import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const execFileP = promisify(execFile);
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// Source files whose latest git-commit date drives the lastmod for a
// rendered HTML page (root and ?lang=pt). The Tailwind input + config
// stand in for `styles.css`, which is a build artefact.
const PAGE_SOURCES = [
  'index.html',
  'script.js',
  'motion.js',
  'src/i18n.js',
  'src/input.css',
  'tailwind.config.js',
];

// URL → list of source paths (files or directories) whose max
// git-commit date determines that URL's <lastmod>. Adding a new <url>
// to sitemap.xml means adding it here too — otherwise build-sitemap
// will refuse to rewrite, and the freshness guard will flag it.
export const URL_SOURCES = {
  // Root URL also carries the <image:image> sitemap-extension block, so
  // its lastmod additionally reflects the poster / cinema-still / hero
  // image directories: a new poster shipping is a meaningful change to
  // what `/` represents, even if no .html / .js source moved.
  'https://www.martadovale.pt/': [
    ...PAGE_SOURCES,
    'assets/posters',
    'assets/cinema',
    'assets/images/optimized',
  ],
  'https://www.martadovale.pt/?lang=pt': PAGE_SOURCES,
  'https://www.martadovale.pt/llms.txt': ['llms.txt'],
  'https://www.martadovale.pt/llms-full.txt': ['llms-full.txt'],
};

async function gitMtime(path) {
  const { stdout } = await execFileP(
    'git', ['log', '-1', '--format=%cI', '--', path],
    { cwd: projectRoot }
  );
  return stdout.trim() || null;
}

async function latestRepoCommit() {
  const { stdout } = await execFileP(
    'git', ['log', '-1', '--format=%cI'],
    { cwd: projectRoot }
  );
  return stdout.trim();
}

const isoDate = (iso) => iso.slice(0, 10);

async function computeLastmod(paths) {
  const mtimes = (await Promise.all(paths.map(gitMtime))).filter(Boolean);
  // Shallow clones (`git clone --depth=1`) have no per-file history for
  // files untouched in the cloned commit. Fall back to the head commit
  // so a freshly cloned CI runner still produces sane dates.
  if (mtimes.length === 0) return isoDate(await latestRepoCommit());
  return isoDate(mtimes.reduce((a, b) => (a > b ? a : b)));
}

export async function computeAllLastmods() {
  const entries = await Promise.all(
    Object.entries(URL_SOURCES).map(async ([loc, paths]) => [loc, await computeLastmod(paths)])
  );
  return Object.fromEntries(entries);
}

export function rewriteSitemap(xml, lastmods) {
  const unknown = [];
  const out = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
    const locM = block.match(/<loc>([^<]+)<\/loc>/);
    if (!locM) return block;
    const loc = locM[1].trim();
    const target = lastmods[loc];
    if (target === undefined) { unknown.push(loc); return block; }
    return block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${target}</lastmod>`);
  });
  if (unknown.length) {
    throw new Error(
      `sitemap.xml contains URLs with no entry in URL_SOURCES: ${unknown.join(', ')}\n` +
      'Add the URL to scripts/build-sitemap.mjs (URL_SOURCES) or remove it from sitemap.xml.'
    );
  }
  return out;
}

async function main() {
  const { values } = parseArgs({ options: { out: { type: 'string' } } });
  const inPath = join(projectRoot, 'sitemap.xml');
  const outPath = values.out
    ? (isAbsolute(values.out) ? values.out : resolve(process.cwd(), values.out))
    : inPath;
  const xml = await readFile(inPath, 'utf8');
  const lastmods = await computeAllLastmods();
  const rewritten = rewriteSitemap(xml, lastmods);
  await writeFile(outPath, rewritten);
  console.log(`sitemap.xml -> ${outPath}`);
  for (const [loc, lm] of Object.entries(lastmods)) {
    console.log(`  ${lm}  ${loc}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
