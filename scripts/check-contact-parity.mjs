#!/usr/bin/env node
//
// Contact-info parity guard. Run as part of `npm test`.
//
// Marta's email and phone appear in `index.html` in at least four places
// today: the Person JSON-LD in <head> (canonical source), the visible
// contact section's email/WhatsApp cards, the contact-modal email card,
// and the contact-modal WhatsApp card. The vCard sync guard
// (`build-vcard.mjs --check`) already prevents the saved-to-phone .vcf
// from drifting from the JSON-LD. This guard closes the matching loop
// on the visible page — a contributor who updates the email in a card
// body but forgets to update the JSON-LD ships a page where the
// on-screen value and the canonical Person block (and therefore the
// vCard) silently disagree.
//
// Same shape as the other sync guards already in `npm test`:
// check-films-sync (data-list ↔ rendered cards ↔ sitemap),
// check-sitemap-freshness (sitemap mtime ↔ source files),
// check-preload-coherence (preload ↔ <img>/@font-face).
//
// The Person JSON-LD is the single source of truth — `extractPersonJsonLd`
// is imported from `build-vcard.mjs` so the parser is not duplicated.
// We do NOT check `<head>` (re-asserting the JSON-LD against itself is
// circular) and we do NOT auto-fix (the canonical value is a human
// decision, not a mechanical derivation).
//
// Pure Node stdlib + jsdom (already a dep). No network, no file
// modifications.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { extractPersonJsonLd } from './build-vcard.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// index.html owns the canonical Person block. 404.html does not declare
// one and does not surface contact info today; we still walk it so any
// future contact reference is held to the same canonical values.
const CANONICAL_SOURCE = 'index.html';
const TARGETS = [
  { file: 'index.html', scopes: [
    { selector: 'main', label: '<main>' },
    { selector: '.contact-modal', label: '.contact-modal' },
  ] },
  { file: '404.html', scopes: [
    { selector: 'main', label: '<main>' },
  ] },
];

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;

const REMEDIATION =
  'Update either the Person JSON-LD or the visible card so both match — ' +
  'they are deliberately duplicated for screen readers and JSON-LD ' +
  'consumers. The Person block in <head> is the canonical source the ' +
  'vCard derives from.';

// jsdom doesn't expose source positions; approximate with a substring
// scan against the raw HTML, mirroring the trick used by check-html.mjs
// for json-ld and <img> openers. `html.indexOf(needle)` finds the first
// occurrence, which is sufficient for a FAIL hint pointing at the
// offending line.
function lineOf(html, needle) {
  if (needle === null || needle === undefined) return null;
  const idx = html.indexOf(needle);
  if (idx < 0) return null;
  return html.slice(0, idx).split('\n').length;
}

// Walk every text node descendant of `root`. jsdom's TreeWalker honours
// document order; <script> and <style> contents are returned as text
// nodes too, but neither appears inside <main> or .contact-modal in this
// codebase, and even if one did the email regex would simply not match.
function* walkTextNodes(root) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const walker = doc.createTreeWalker(root, win.NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) yield n;
}

// One result row per (file, scope, assertion-class). `count` is the
// number of occurrences inspected; `fails` is the subset whose value
// did not match the canonical. An ok row prints `count`/`count`; a
// FAIL row prints one offender per failure.
function checkScope({ file, html, scopeRoot, scopeLabel, canonical }) {
  const rows = [];

  // 1. <a href="mailto:..."> hrefs
  const mailtoLinks = [...scopeRoot.querySelectorAll('a[href^="mailto:" i]')];
  const mailtoFails = [];
  for (const a of mailtoLinks) {
    const href = a.getAttribute('href') || '';
    const observed = href.replace(/^mailto:/i, '');
    if (observed !== canonical.email) {
      mailtoFails.push({
        line: lineOf(html, `href="${href}"`) ?? lineOf(html, href),
        observed: href,
        expected: `mailto:${canonical.email}`,
      });
    }
  }
  rows.push({
    file,
    label: `${scopeLabel} mailto href`,
    count: mailtoLinks.length,
    fails: mailtoFails,
  });

  // 2. visible-text email occurrences. Walk text nodes only (so href
  //    attribute values are not double-counted) and scan each for the
  //    email regex. Catches a card body whose displayed string drifted
  //    from the <a> href.
  const textEmailMatches = [];
  for (const node of walkTextNodes(scopeRoot)) {
    const text = node.textContent || '';
    EMAIL_RE.lastIndex = 0;
    let m;
    while ((m = EMAIL_RE.exec(text)) !== null) {
      textEmailMatches.push(m[0]);
    }
  }
  const textEmailFails = [];
  for (const value of textEmailMatches) {
    if (value !== canonical.email) {
      textEmailFails.push({
        line: lineOf(html, value),
        observed: value,
        expected: canonical.email,
      });
    }
  }
  rows.push({
    file,
    label: `${scopeLabel} visible-text email`,
    count: textEmailMatches.length,
    fails: textEmailFails,
  });

  // 3. <a href*="api.whatsapp.com/send"> — extract `phone=<digits>` and
  //    compare to the canonical digits-only form (no leading +).
  const waLinks = [...scopeRoot.querySelectorAll('a[href*="api.whatsapp.com/send"]')];
  const waFails = [];
  for (const a of waLinks) {
    const href = a.getAttribute('href') || '';
    const m = href.match(/[?&]phone=([^&#]*)/);
    const observed = m ? m[1] : '(no phone= param)';
    if (observed !== canonical.whatsapp) {
      waFails.push({
        line: lineOf(html, `href="${href}"`) ?? lineOf(html, href),
        observed,
        expected: canonical.whatsapp,
      });
    }
  }
  rows.push({
    file,
    label: `${scopeLabel} whatsapp phone`,
    count: waLinks.length,
    fails: waFails,
  });

  // 4. <a href="tel:..."> hrefs
  const telLinks = [...scopeRoot.querySelectorAll('a[href^="tel:" i]')];
  const telFails = [];
  for (const a of telLinks) {
    const href = a.getAttribute('href') || '';
    const observed = href.replace(/^tel:/i, '');
    if (observed !== canonical.telephone) {
      telFails.push({
        line: lineOf(html, `href="${href}"`) ?? lineOf(html, href),
        observed: href,
        expected: `tel:${canonical.telephone}`,
      });
    }
  }
  rows.push({
    file,
    label: `${scopeLabel} tel href`,
    count: telLinks.length,
    fails: telFails,
  });

  return rows;
}

// ---------- run ----------

const indexHtml = await readFile(join(projectRoot, CANONICAL_SOURCE), 'utf8');
const person = extractPersonJsonLd(indexHtml);

const canonicalEmail = String(person.email || '').replace(/^mailto:/i, '');
const canonicalTelephone = String(person.telephone || '');
const canonicalWhatsapp = canonicalTelephone.replace(/^\+/, '');

if (!canonicalEmail || !canonicalTelephone) {
  console.error(
    `Person JSON-LD in ${CANONICAL_SOURCE} is missing email or telephone — ` +
      'cannot derive canonical contact values. Add both to the Person block.'
  );
  process.exit(1);
}

const canonical = {
  email: canonicalEmail,
  telephone: canonicalTelephone,
  whatsapp: canonicalWhatsapp,
};

const allRows = [];
for (const target of TARGETS) {
  const html =
    target.file === CANONICAL_SOURCE
      ? indexHtml
      : await readFile(join(projectRoot, target.file), 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  for (const scope of target.scopes) {
    const scopeRoot = doc.querySelector(scope.selector);
    if (!scopeRoot) continue; // e.g. .contact-modal absent from 404.html
    for (const row of checkScope({
      file: target.file,
      html,
      scopeRoot,
      scopeLabel: scope.label,
      canonical,
    })) {
      allRows.push(row);
    }
  }
}

const fileWidth = Math.max(...allRows.map((r) => r.file.length));
const labelWidth = Math.max(...allRows.map((r) => r.label.length));

let totalFails = 0;
for (const r of allRows) {
  const ok = r.fails.length === 0;
  if (!ok) totalFails += r.fails.length;
  const status = ok ? 'ok' : 'FAIL';
  const passed = r.count - r.fails.length;
  console.log(
    `${status.padEnd(4)}  ${r.file.padEnd(fileWidth)}  ${r.label.padEnd(labelWidth)}  ${passed}/${r.count} match canonical`
  );
}

if (totalFails > 0) {
  console.log('');
  console.log(
    `        FILE  LINE  ASSERTION                    OBSERVED  →  EXPECTED`
  );
  for (const r of allRows) {
    if (!r.fails.length) continue;
    for (const f of r.fails) {
      const lineLabel = f.line ? `~${f.line}` : '?';
      console.log(
        `        ${r.file}  line ${lineLabel}  ${r.label}  "${f.observed}"  →  "${f.expected}"`
      );
    }
  }
  console.error(
    `\nContact parity check failed (${totalFails} offender${totalFails === 1 ? '' : 's'}). ${REMEDIATION}`
  );
  process.exit(1);
}

console.log(
  `\n${TARGETS.length} files · ${allRows.length} assertion classes · ` +
    `canonical email "${canonical.email}", telephone "${canonical.telephone}", ` +
    `whatsapp digits "${canonical.whatsapp}"`
);
