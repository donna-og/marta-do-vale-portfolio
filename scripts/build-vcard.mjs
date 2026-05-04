#!/usr/bin/env node
//
// vCard 3.0 generator — derived from the Person JSON-LD in index.html.
//
// Usage:
//   node scripts/build-vcard.mjs           # writes assets/contact/marta-do-vale.vcf
//   node scripts/build-vcard.mjs --check   # exit non-zero if the file on disk
//                                          # differs from what would be written
//
// The Person JSON-LD block in <head> already carries every field a
// producer needs to drop into their phone's address book — name,
// jobTitle, email, telephone, address.addressLocality +
// addressCountry, url, sameAs[]. Hand-writing a parallel .vcf would
// create the same silent-drift problem the sitemap freshness guard
// (task 0047) was built for: a future contributor updates the email or
// phone in the canonical Person block and the .vcf file ships frozen.
// Deriving the .vcf from the JSON-LD at build time keeps the two
// synchronised; the --check mode in `npm test` fails the build if a
// contributor edited the Person block without re-running this script.
//
// vCard 3.0 (RFC 2426) is the broadest-compatible format — iOS
// Contacts, macOS Contacts, Android, Outlook, Gmail all parse it
// cleanly. Lines use CRLF (RFC 6350 §3.2) and long lines are unfolded
// per the spec (75-octet boundary, continuation lines start with a
// single space). PHOTO is intentionally omitted: a base64-embedded
// portrait would inflate the .vcf well past the 2 KB target for
// effectively zero producer-value.
//
// Pure Node stdlib — no deps.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const SOURCE = 'index.html';
const OUTPUT = 'assets/contact/marta-do-vale.vcf';

// Pull the first <script type="application/ld+json"> block whose
// parsed JSON has @type === "Person". Robust to the Person block being
// in any position relative to the ItemList block — today it's first,
// but the parser shouldn't depend on that.
export function extractPersonJsonLd(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch { continue; }
    const blocks = Array.isArray(parsed) ? parsed : [parsed];
    for (const b of blocks) {
      if (b && typeof b === 'object' && b['@type'] === 'Person') return b;
    }
  }
  throw new Error(
    'No Person JSON-LD block found in index.html. The vCard generator ' +
    'derives every field from that block — check that ' +
    '<script type="application/ld+json">…"@type":"Person"…</script> ' +
    'still exists in <head>.'
  );
}

// vCard 3.0 escaping: backslash, comma, semicolon, newline. Order
// matters — the backslash escape must run first so we don't double-
// escape the escapes we're about to insert.
function escapeValue(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// RFC 6350 §3.2: lines longer than 75 octets are folded; continuation
// lines start with a single space. Counting characters here is a
// reasonable approximation for the ASCII-only fields this vCard
// emits — none of which are anywhere close to 75 chars in practice,
// but the unfolding is here so the format is correct by construction.
function foldLine(line) {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    parts.push(' ' + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join('\r\n');
}

function stripMailto(email) {
  return String(email).replace(/^mailto:/i, '');
}

// Surname + given-name from "Marta do Vale". Schema.org Person.name is
// a single string; vCard N is structured as Family;Given;Middle;Prefix;Suffix.
// "do Vale" is the family name (Portuguese particle + surname); "Marta"
// is the given name. Hand-coding this is preferable to splitting on
// whitespace and getting it wrong.
function splitName(fullName) {
  if (fullName === 'Marta do Vale') {
    return { family: 'do Vale', given: 'Marta' };
  }
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length === 1) return { family: '', given: parts[0] };
  return { family: parts.slice(1).join(' '), given: parts[0] };
}

export function buildVcard(person) {
  const lines = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  const { family, given } = splitName(person.name);
  lines.push('N:' + escapeValue(family) + ';' + escapeValue(given) + ';;;');
  lines.push('FN:' + escapeValue(person.name));

  if (person.jobTitle) {
    lines.push('TITLE:' + escapeValue(person.jobTitle));
  }

  if (person.email) {
    lines.push('EMAIL;TYPE=INTERNET,PREF:' + escapeValue(stripMailto(person.email)));
  }

  if (person.telephone) {
    lines.push('TEL;TYPE=CELL,VOICE:' + escapeValue(person.telephone));
  }

  if (person.address && (person.address.addressLocality || person.address.addressCountry)) {
    const locality = escapeValue(person.address.addressLocality || '');
    const country = escapeValue(person.address.addressCountry || '');
    // ADR structure: PO;Ext;Street;Locality;Region;Postal;Country
    lines.push('ADR;TYPE=WORK:;;;' + locality + ';;;' + country);
  }

  if (person.url) {
    lines.push('URL:' + escapeValue(person.url));
  }

  if (Array.isArray(person.sameAs)) {
    for (const link of person.sameAs) {
      lines.push('URL:' + escapeValue(link));
    }
  }

  lines.push('END:VCARD');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

async function main() {
  const { values } = parseArgs({ options: { check: { type: 'boolean' } } });
  const inPath = join(projectRoot, SOURCE);
  const outPath = join(projectRoot, OUTPUT);

  const html = await readFile(inPath, 'utf8');
  const person = extractPersonJsonLd(html);
  const generated = buildVcard(person);

  if (values.check) {
    let onDisk;
    try { onDisk = await readFile(outPath, 'utf8'); }
    catch { onDisk = null; }
    if (onDisk !== generated) {
      console.error(
        `\nvCard out of date — run \`npm run build:vcard\`.\n` +
        `${OUTPUT} does not match the Person JSON-LD in ${SOURCE}. ` +
        'The vCard is derived from that block at build time, so editing ' +
        'the Person block (email, phone, sameAs, etc.) requires a ' +
        'follow-up `npm run build:vcard` and committing the regenerated ' +
        '.vcf alongside the change.'
      );
      process.exit(1);
    }
    console.log(`ok  ${OUTPUT} matches Person JSON-LD (${generated.length} bytes)`);
    return;
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, generated);
  console.log(`${SOURCE} -> ${OUTPUT}  (${generated.length} bytes)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
