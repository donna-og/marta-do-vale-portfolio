#!/usr/bin/env node
//
// ProfilePage entity-graph guard. Run as part of `npm test`.
//
// `index.html` ships four JSON-LD blocks: a ProfilePage wrapper, a
// Person, a cinema ItemList, and a commercial ItemList. Each parses
// cleanly on its own, but only the ProfilePage's `mainEntity` and
// `hasPart` references stitch them into a connected entity graph
// that crawlers and AI agents can resolve. Drift in those references
// (a renamed `@id`, an ItemList that grew an `@id` but never made it
// into `hasPart`, an `inLanguage` array reordered to put PT first
// and contradict the page's `<html lang>`, a `primaryImageOfPage.url`
// that points at a different file than the `og:image` meta) breaks
// the graph silently — JSON parses, Lighthouse stays green, but
// Schema Markup Validator and the Knowledge Graph see two
// disconnected nodes instead of one profile.
//
// `404.html` mirrors the ProfilePage but references the canonical
// `index.html` Person via absolute `@id` URL — the Person block
// lives in one place only.
//
// Pure Node stdlib + a minimal regex JSON-LD extractor. No deps,
// no network, no file modifications.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://www.martadovale.pt/';
const CANONICAL_PERSON_ID = 'https://www.martadovale.pt/#person';
const REQUIRED_PROFILEPAGE_KEYS = [
  '@id',
  'url',
  'name',
  'inLanguage',
  'primaryImageOfPage',
  'mainEntity',
  'hasPart',
];
const EXPECTED_INLANGUAGE = ['en', 'pt'];
const EXPECTED_HASPART_INDEX = [
  'https://www.martadovale.pt/#cinema-credits',
  'https://www.martadovale.pt/#commercial-credits',
];

function extractJsonLdBlocks(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script\s+type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g)) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch (e) {
      throw new Error(`Failed to parse a JSON-LD block: ${e.message}`);
    }
  }
  return blocks;
}

function findFirst(blocks, type) {
  return blocks.find((b) => b && b['@type'] === type) || null;
}

function findAllByType(blocks, type) {
  return blocks.filter((b) => b && b['@type'] === type);
}

function findById(blocks, id) {
  return blocks.find((b) => b && b['@id'] === id) || null;
}

// Resolve `value` against `base` like a browser would, but only for
// the simple cases this guard meets: an absolute http(s) URL passes
// through, a path-relative URL is appended to base. The og:image
// meta in index.html is "assets/social/og-card.png"; the JSON-LD
// declares the absolute form. Both must resolve identically.
function resolveAgainst(base, value) {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return new URL(value, base).toString();
  return new URL(value, base).toString();
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

const results = [];
let totalFails = 0;

function record(file, label, ok, detail) {
  const row = { file, label, ok, detail };
  results.push(row);
  if (!ok) totalFails++;
  return row;
}

async function checkIndexHtml() {
  const file = 'index.html';
  const html = await readFile(join(projectRoot, file), 'utf8');
  const blocks = extractJsonLdBlocks(html);

  // 1. Find ProfilePage
  const profilePages = findAllByType(blocks, 'ProfilePage');
  if (profilePages.length !== 1) {
    record(file, 'ProfilePage exactly once', false, {
      observed: `${profilePages.length} blocks of @type "ProfilePage"`,
      expected: 'exactly 1',
    });
    return;
  }
  record(file, 'ProfilePage exactly once', true, { count: 1 });
  const profile = profilePages[0];

  // 2. Required keys present
  for (const key of REQUIRED_PROFILEPAGE_KEYS) {
    const present = Object.prototype.hasOwnProperty.call(profile, key);
    record(file, `ProfilePage.${key} present`, present, {
      observed: present ? 'present' : 'missing',
      expected: 'present',
    });
  }

  // 3. inLanguage exactly ["en", "pt"]
  const inLangOk = arraysEqual(profile.inLanguage, EXPECTED_INLANGUAGE);
  record(file, 'ProfilePage.inLanguage = ["en","pt"]', inLangOk, {
    observed: JSON.stringify(profile.inLanguage),
    expected: JSON.stringify(EXPECTED_INLANGUAGE),
  });

  // 4. mainEntity.@id resolves to a Person node in same document
  const mainEntityId = profile.mainEntity && profile.mainEntity['@id'];
  const personNode = mainEntityId ? findById(blocks, mainEntityId) : null;
  const mainEntityResolves =
    !!personNode && personNode['@type'] === 'Person';
  record(file, 'ProfilePage.mainEntity.@id → Person node', mainEntityResolves, {
    observed: mainEntityId
      ? `@id "${mainEntityId}" → ${personNode ? `@type "${personNode['@type']}"` : 'no node found'}`
      : 'no mainEntity.@id',
    expected: `@id resolving to @type "Person" in same document`,
  });

  // 5. Every hasPart entry resolves to an ItemList in same document
  const hasPart = Array.isArray(profile.hasPart) ? profile.hasPart : [];
  if (hasPart.length === 0) {
    record(file, 'ProfilePage.hasPart non-empty', false, {
      observed: 'empty array',
      expected: 'at least one ItemList @id',
    });
  } else {
    record(file, 'ProfilePage.hasPart non-empty', true, { count: hasPart.length });
    for (const ref of hasPart) {
      const id = ref && ref['@id'];
      const node = id ? findById(blocks, id) : null;
      const ok = !!node && node['@type'] === 'ItemList';
      record(file, `ProfilePage.hasPart["${id ?? '?'}"] → ItemList node`, ok, {
        observed: id
          ? `@id "${id}" → ${node ? `@type "${node['@type']}"` : 'no node found'}`
          : 'hasPart entry missing @id',
        expected: `@id resolving to @type "ItemList" in same document`,
      });
    }

    // hasPart contains the two expected canonical lists, in order.
    const observedIds = hasPart.map((r) => (r && r['@id']) || '');
    const orderOk = arraysEqual(observedIds, EXPECTED_HASPART_INDEX);
    record(file, 'ProfilePage.hasPart canonical list', orderOk, {
      observed: JSON.stringify(observedIds),
      expected: JSON.stringify(EXPECTED_HASPART_INDEX),
    });
  }

  // 6. primaryImageOfPage.url matches the FIRST og:image meta content,
  //    resolved against the canonical site URL. The first og:image is
  //    declared as the PNG (the others are alternates).
  const ogImageMatch = html.match(
    /<meta\s+property="og:image"\s+content="([^"]+)"\s*\/?>/i
  );
  const ogImageRaw = ogImageMatch ? ogImageMatch[1] : null;
  const ogImageAbs = ogImageRaw ? resolveAgainst(SITE, ogImageRaw) : null;
  const observedImg =
    profile.primaryImageOfPage && profile.primaryImageOfPage.url;
  const imgMatches = !!ogImageAbs && observedImg === ogImageAbs;
  record(file, 'primaryImageOfPage.url = first og:image', imgMatches, {
    observed: `primaryImageOfPage.url "${observedImg ?? '(missing)'}" vs og:image "${ogImageRaw ?? '(missing)'}" (abs "${ogImageAbs ?? '(n/a)'}")`,
    expected: 'absolute URL identical to resolved first og:image meta',
  });
}

async function check404Html() {
  const file = '404.html';
  const html = await readFile(join(projectRoot, file), 'utf8');
  const blocks = extractJsonLdBlocks(html);

  const profilePages = findAllByType(blocks, 'ProfilePage');
  if (profilePages.length !== 1) {
    record(file, 'ProfilePage exactly once', false, {
      observed: `${profilePages.length} blocks of @type "ProfilePage"`,
      expected: 'exactly 1',
    });
    return;
  }
  record(file, 'ProfilePage exactly once', true, { count: 1 });
  const profile = profilePages[0];

  const mainEntityId = profile.mainEntity && profile.mainEntity['@id'];
  const ok = mainEntityId === CANONICAL_PERSON_ID;
  record(file, 'ProfilePage.mainEntity.@id = canonical Person', ok, {
    observed: `"${mainEntityId ?? '(missing)'}"`,
    expected: `"${CANONICAL_PERSON_ID}"`,
  });
}

await checkIndexHtml();
await check404Html();

const fileWidth = Math.max(...results.map((r) => r.file.length));
const labelWidth = Math.max(...results.map((r) => r.label.length));

for (const r of results) {
  const status = r.ok ? 'ok' : 'FAIL';
  const detail = r.ok
    ? r.detail && r.detail.count !== undefined
      ? `count=${r.detail.count}`
      : 'matches canonical'
    : `observed ${r.detail.observed} | expected ${r.detail.expected}`;
  console.log(
    `${status.padEnd(4)}  ${r.file.padEnd(fileWidth)}  ${r.label.padEnd(labelWidth)}  ${detail}`
  );
}

if (totalFails > 0) {
  console.error(
    `\nProfilePage graph check failed (${totalFails} offender${totalFails === 1 ? '' : 's'}). ` +
      'Re-link the four JSON-LD blocks: ProfilePage @id "#profile" with mainEntity → Person ' +
      'and hasPart → cinema/commercial ItemLists. The Person and ItemList @ids must match the ' +
      'absolute URLs hard-coded in this guard.'
  );
  process.exit(1);
}

console.log(
  `\n2 files · ${results.length} assertions · canonical Person @id "${CANONICAL_PERSON_ID}"`
);
