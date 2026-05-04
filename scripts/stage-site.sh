#!/usr/bin/env bash
#
# Stage the publishable site to ./_site for any static host (GitHub
# Pages, Vercel, Netlify, S3, etc). Mirrors the staging step in
# .github/workflows/deploy.yml so behavior is identical across hosts.
#
# Run after `npm run build:css` so styles.css is current. Sitemap is
# stamped via scripts/build-sitemap.mjs at the end so lastmod reflects
# the build moment.

set -euo pipefail

OUT="${1:-_site}"

rm -rf "$OUT"
mkdir -p "$OUT/src" "$OUT/assets"

cp index.html "$OUT/"
cp 404.html "$OUT/"
cp styles.css "$OUT/"
cp script.js "$OUT/"
cp motion.js "$OUT/"
cp site.webmanifest "$OUT/"
cp robots.txt "$OUT/"
cp sitemap.xml "$OUT/"
cp llms.txt "$OUT/"
cp llms-full.txt "$OUT/"
cp src/i18n.js "$OUT/src/"
cp -R assets/. "$OUT/assets/"

node scripts/build-sitemap.mjs --out="$OUT/sitemap.xml"

echo "Staged to $OUT/"
