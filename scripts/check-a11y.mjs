#!/usr/bin/env node
//
// Axe-core accessibility guard. Run as part of `npm test`.
//
// Boots index.html and 404.html through jsdom (scripts enabled,
// resources usable so the deferred script.js can populate
// #film-grid before the audit fires), injects axe-core into the
// jsdom window, and runs the WCAG 2.0 / 2.1 A + AA rule packs
// plus axe best-practices. Critical and serious violations exit
// non-zero with one line per finding (rule id, impact, target
// selector, summary, helpUrl). Moderate and minor violations are
// surfaced on stderr as warnings — they document drift but do not
// fail the build. The point-in-time pass from task 0025 set the
// floor; this guard keeps it from sliding back.
//
// Pure Node — axe-core ships a browser bundle that we eval into
// the jsdom window. Headless Chrome would double the test
// runtime and add a multi-hundred-MB dependency for rules that
// jsdom already covers.
//
// Skipped rules: SKIPPED_RULES below. Empty by default. Add an
// entry only when an axe rule cannot be satisfied without
// changing the design language. Each entry must include:
//   - rule id (the short string axe reports, e.g. "color-contrast")
//   - axe helpUrl
//   - one-line reason
//   - the date (YYYY-MM-DD) the waiver was added, so the
//     allowlist can be re-evaluated later. If a polish pass
//     removes the constraint, drop the entry in the same PR.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { JSDOM, VirtualConsole } from 'jsdom';

const require_ = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const TARGETS = [
  { file: 'index.html', waitForFilmGrid: true },
  { file: '404.html',   waitForFilmGrid: false },
];

// Allowlist of axe rule ids whose violations should be ignored
// at the critical/serious floor. Format: { id, helpUrl, reason,
// added }. Keep this list tiny and re-evaluate every release.
// Entries should describe a concrete design constraint, not "we
// haven't fixed it yet" — for the latter, fix the markup.
const SKIPPED_RULES = [];

const FAIL_IMPACTS = new Set(['critical', 'serious']);
const WARN_IMPACTS = new Set(['moderate', 'minor']);

const FILM_GRID_TIMEOUT_MS = 5000;

const axeSource = await readFile(require_.resolve('axe-core/axe.min.js'), 'utf8');

function makeQuietConsole() {
  // jsdom raises a lot of noise when scripts touch APIs it
  // doesn't fully implement (canvas, IntersectionObserver,
  // matchMedia edge cases). None of that is signal for an
  // accessibility audit, so swallow it. Real script errors are
  // surfaced via the `jsdomError` channel which we keep silent
  // by design — script.js renders the film grid synchronously,
  // and the polling loop below catches the cases where the grid
  // never appears.
  const vc = new VirtualConsole();
  return vc;
}

async function bootDom(absPath) {
  const html = await readFile(absPath, 'utf8');
  const dom = new JSDOM(html, {
    url: pathToFileURL(absPath).href,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: makeQuietConsole(),
  });
  // Wait for `load` so deferred scripts have run.
  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') {
      resolve();
    } else {
      dom.window.addEventListener('load', () => resolve(), { once: true });
    }
  });
  return dom;
}

async function waitForFilmGrid(dom) {
  const start = Date.now();
  while (Date.now() - start < FILM_GRID_TIMEOUT_MS) {
    const populated = dom.window.document.querySelector(
      '#film-grid [data-film-title], #film-grid [data-film-id]',
    );
    if (populated) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(
    'check-a11y: #film-grid never populated within ' +
      `${FILM_GRID_TIMEOUT_MS}ms — script.js may have errored before ` +
      'rendering the commercial reel. Run `npm test` after a fresh ' +
      '`npm run build:css` and verify the page in a browser.',
  );
}

async function runAxe(dom) {
  // Inject the axe-core browser bundle into the jsdom window so
  // axe.run can introspect document/window from inside the same
  // realm.
  dom.window.eval(axeSource);
  return dom.window.axe.run(dom.window.document, {
    resultTypes: ['violations'],
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
  });
}

function describeNode(node) {
  // axe gives us an array of CSS selectors; the first is the
  // most specific. Trim absurdly long selectors to keep one
  // violation = one readable line.
  const target = Array.isArray(node.target) ? node.target.join(' ') : String(node.target || '');
  return target.length > 120 ? `${target.slice(0, 117)}...` : target;
}

function summarize(violations) {
  const fails = [];
  const warns = [];
  for (const v of violations) {
    if (SKIPPED_RULES.some((r) => r.id === v.id)) continue;
    const impact = v.impact || 'minor';
    for (const node of v.nodes) {
      const row = {
        id: v.id,
        impact,
        target: describeNode(node),
        summary: node.failureSummary
          ? node.failureSummary.split('\n').slice(0, 1).join(' ').trim()
          : v.help,
        helpUrl: v.helpUrl,
      };
      if (FAIL_IMPACTS.has(impact)) fails.push(row);
      else if (WARN_IMPACTS.has(impact)) warns.push(row);
    }
  }
  return { fails, warns };
}

function format(row) {
  return `${row.id} [${row.impact}] ${row.target} — ${row.summary} (${row.helpUrl})`;
}

let totalFails = 0;
let totalWarns = 0;
let totalRulesChecked = 0;

for (const target of TARGETS) {
  const absPath = join(projectRoot, target.file);
  const dom = await bootDom(absPath);
  if (target.waitForFilmGrid) await waitForFilmGrid(dom);

  const results = await runAxe(dom);
  const ran = (results.passes || []).length +
    (results.violations || []).length +
    (results.incomplete || []).length +
    (results.inapplicable || []).length;
  totalRulesChecked += ran;

  const { fails, warns } = summarize(results.violations || []);
  totalFails += fails.length;
  totalWarns += warns.length;

  const status = fails.length === 0 ? 'ok' : 'FAIL';
  console.log(
    `${status.padEnd(4)}  ${target.file.padEnd(12)}  ` +
      `${ran} rules · ${fails.length} critical/serious · ${warns.length} moderate/minor`,
  );

  for (const row of fails) {
    console.log(`        ${format(row)}`);
  }
  for (const row of warns) {
    console.error(`warn    ${target.file}  ${format(row)}`);
  }

  // Free the jsdom window so the next iteration starts cold.
  dom.window.close();
}

console.log(
  `\na11y: ${totalRulesChecked} rules checked across ${TARGETS.length} ` +
    `pages · ${totalFails} critical/serious violations · ` +
    `${totalWarns} moderate/minor warning(s)`,
);

if (totalFails > 0) {
  console.error(
    '\nA11y check failed. Fix the markup so the rendered DOM stops ' +
      'tripping the axe rule(s) above. Each violation includes a helpUrl ' +
      'with concrete remediation steps. Floors only go up — do not relax ' +
      'a rule to make this guard pass.',
  );
  process.exit(1);
}
