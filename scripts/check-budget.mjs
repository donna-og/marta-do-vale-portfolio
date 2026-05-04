#!/usr/bin/env node
//
// Performance budget guard. Run as part of `npm test`.
//
// Walks each listed file or directory, sums the source bytes, and exits
// non-zero if any path exceeds its cap. Prints a single aligned table so
// CI logs are debuggable without rerunning locally.
//
// Caps below are calibrated against the actual sizes at the time this
// script was added, plus ~15–30% headroom (smaller files get a larger
// relative cushion by necessity). They are guard rails, not aspirations:
// when the site is genuinely supposed to grow (e.g. new film posters),
// bump the relevant cap in the same PR with a one-line note in the
// commit message. The intent is "no silent regressions," not "no growth
// ever."
//
// Pure Node stdlib — no deps. Source bytes only; transfer-size (gzip /
// brotli) is left to the host.

import { stat, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const KB = 1024;

const budgets = [
  { path: 'styles.css',                                 max:   38 * KB },
  { path: 'script.js',                                  max:   44 * KB },
  { path: 'motion.js',                                  max:    8 * KB },
  { path: 'index.html',                                 max:   78 * KB },
  { path: 'assets/fonts/optimized',   recurse: true,    max:  300 * KB },
  { path: 'assets/images/optimized',  recurse: true,    max: 3700 * KB },
  { path: 'assets/posters/optimized', recurse: true,    max: 3000 * KB },
  { path: 'assets/cinema/posters/optimized', recurse: true, max: 1500 * KB },
  { path: 'assets/icons',             recurse: true,    max:   60 * KB },
  { path: 'assets/social',            recurse: true,    max:  200 * KB }
];

async function size(relPath) {
  const full = join(projectRoot, relPath);
  const s = await stat(full);
  if (!s.isDirectory()) return s.size;
  let total = 0;
  for (const entry of await readdir(full, { withFileTypes: true })) {
    total += await size(join(relPath, entry.name));
  }
  return total;
}

const human = (n) => `${(n / KB).toFixed(1)}KB`;

let failed = false;
for (const b of budgets) {
  const actual = await size(b.path);
  const ratio = (actual / b.max * 100).toFixed(1);
  const status = actual > b.max ? 'FAIL' : 'ok';
  console.log(
    `${status.padEnd(4)}  ${b.path.padEnd(34)} ` +
    `${human(actual).padStart(10)} / ${human(b.max).padStart(10)}  ` +
    `(${ratio}%)`
  );
  if (actual > b.max) failed = true;
}

if (failed) {
  console.error(
    '\nPerformance budget exceeded. Either optimize the offending asset ' +
    'or raise the cap with a one-line justification in the commit message.'
  );
  process.exit(1);
}
