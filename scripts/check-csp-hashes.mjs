#!/usr/bin/env node
//
// CSP inline-script hash guard. Run as part of `npm test`.
//
// Re-derives the SHA-256 of every executable inline <script> in
// index.html and compares against the hash list in the page's
// Content-Security-Policy script-src directive. Hard-fails when an
// inline script is missing from the directive (CSP would block it) or
// when a directive hash has no matching inline script (dead entry).
// JSON-LD (type="application/ld+json") and external (src="...")
// scripts are skipped: they don't need hashes.
//
// `--fix` rewrites the script-src directive in place to match the
// computed hashes, preserving every other byte of index.html. The fix
// is intentionally manual — auto-mutating CSP from CI would silently
// whitelist any inline script someone accidentally adds.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const htmlPath = join(projectRoot, 'index.html');
const fix = process.argv.includes('--fix');

const EXEC_TYPES = new Set(['', 'text/javascript', 'module']);

function findInlineScripts(html) {
  const scripts = [];
  let i = 0;
  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html.startsWith('<script', i) && /[\s>]/.test(html[i + 7] ?? '')) {
      const tagEnd = html.indexOf('>', i + 7);
      if (tagEnd === -1) break;
      const closeIdx = html.indexOf('</script>', tagEnd + 1);
      if (closeIdx === -1) break;
      scripts.push({
        attrs: html.slice(i + 7, tagEnd),
        body: html.slice(tagEnd + 1, closeIdx),
        lineNum: html.slice(0, i).split('\n').length
      });
      i = closeIdx + 9;
      continue;
    }
    i++;
  }
  return scripts;
}

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return m ? m[1] : null;
}

function isExecutable(s) {
  if (attr(s.attrs, 'src') !== null) return false;
  return EXEC_TYPES.has((attr(s.attrs, 'type') ?? '').trim().toLowerCase());
}

const hashBody = (body) =>
  'sha256-' + createHash('sha256').update(body, 'utf8').digest('base64');

const html = await readFile(htmlPath, 'utf8');
const executable = findInlineScripts(html)
  .filter(isExecutable)
  .map(s => ({ ...s, hash: hashBody(s.body) }));

const cspMeta = html.match(/<meta\s+http-equiv\s*=\s*"Content-Security-Policy"\s+content\s*=\s*"([^"]*)"\s*\/?>/i);
if (!cspMeta) throw new Error('Content-Security-Policy meta tag not found in index.html');
const directives = cspMeta[1].split(';').map(d => d.trim()).filter(Boolean);
const dirIdx = directives.findIndex(d => d.startsWith('script-src '));
if (dirIdx === -1) throw new Error('script-src directive not found in CSP meta');
const cspHashes = directives[dirIdx].split(/\s+/)
  .filter(t => t.startsWith("'sha256-") && t.endsWith("'"))
  .map(t => t.slice(1, -1));

const computedSet = new Set(executable.map(s => s.hash));
const cspSet = new Set(cspHashes);
const missing = executable.filter(s => !cspSet.has(s.hash));
const dead = cspHashes.filter(h => !computedSet.has(h));

if (fix) {
  const newScriptSrc = ['script-src', "'self'", ...executable.map(s => `'${s.hash}'`)].join(' ');
  const oldScriptSrc = directives[dirIdx];
  if (oldScriptSrc === newScriptSrc) {
    console.log('script-src already matches computed hashes — no change.');
    process.exit(0);
  }
  const newDirectives = directives.slice();
  newDirectives[dirIdx] = newScriptSrc;
  const newMeta = cspMeta[0].replace(cspMeta[1], newDirectives.join('; '));
  await writeFile(htmlPath, html.replace(cspMeta[0], newMeta));
  console.log('-', oldScriptSrc);
  console.log('+', newScriptSrc);
  process.exit(0);
}

const rows = [
  { label: 'Inline scripts hashed in CSP',                count: executable.length, fail: missing.length > 0 },
  { label: 'CSP hashes still backing an inline script',   count: cspHashes.length, fail: dead.length > 0 }
];

let failed = false;
for (const r of rows) {
  const status = r.fail ? 'FAIL' : 'ok';
  console.log(`${status.padEnd(4)}  ${r.label.padEnd(45)}  ${String(r.count).padStart(3)}`);
  if (r.fail) failed = true;
}

if (missing.length) {
  console.log('\nFAIL  Inline scripts missing from CSP script-src:');
  for (const s of missing) console.log(`        line ${s.lineNum}  ${s.hash}`);
}
if (dead.length) {
  console.log('\nFAIL  CSP hashes with no matching inline script:');
  for (const h of dead) console.log(`        ${h}`);
}

if (failed) {
  console.error(
    '\nCSP script-src hash drift. Run `node scripts/check-csp-hashes.mjs --fix` ' +
    'to rewrite the directive in index.html, then commit the change.'
  );
  process.exit(1);
}
