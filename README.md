# Marta do Vale — Portfolio Site

![CI](https://github.com/donna-og/marta-do-vale-portfolio/actions/workflows/ci.yml/badge.svg) ![Lighthouse](https://github.com/donna-og/marta-do-vale-portfolio/actions/workflows/lighthouse.yml/badge.svg)

A polished static portfolio site for Marta do Vale, art director and production designer.

## Stack

- Plain HTML/CSS/JS — no framework, no build server
- Tailwind v3 compiled to `styles.css` via `npm run build:css`
- Deploys as a static site (GitHub Pages target)

## Local preview

```bash
npm install
npm run build:css
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Tests

```bash
npm test
```

Runs the CSS build, syntax-checks `script.js` and the build scripts, then runs the performance-budget guard (`scripts/check-budget.mjs`). The guard sums the bytes of each shipped file and asset directory and fails if anything exceeds its cap — so an unoptimized poster or a chunky JS feature can't silently regress the site. When growth is legitimate (e.g. a new film with new posters), bump the relevant `max:` value in `scripts/check-budget.mjs` in the same PR with a one-line reason in the commit message.

Every PR also runs Lighthouse (desktop preset) against the built site, scoring `index.html` in EN and PT with three runs each. Floors for performance, accessibility, best-practices, and SEO live in `lighthouserc.json`; the run uploads to temporary public storage so reviewers can click through the full report. A handful of audits are intentionally skipped — `uses-http2`, `is-on-https`, `redirects-http` (the local server is plain HTTP/1.1) and `csp-xss` (which fights the design's inline-style requirements; `scripts/check-csp-hashes.mjs` already covers what matters). Same byte-budget ethos: floors are not aspirations — when polish lifts a score, raise the floor in the same PR.

## Updating content

- **Films grid**: edit the `films` array at the top of `script.js`. Each entry has `title`, `subtitle`, `kind` (`youtube` or `mp4`), `videoId` or `videoSrc`, `poster`, and a desktop grid `size` class.
- **Posters**: drop new images into `assets/posters/` and reference them from the `films` entry.
- **Hero / About images**: live in `assets/images/` and are referenced directly from `index.html`.
- **Fonts**: served locally from `assets/fonts/` and registered in `src/input.css`.
- **Design tokens**: easing and duration custom properties (`--ease-classy`, `--dur-fast/mid/reveal`) live at the top of `src/input.css`. Adjust there to retune motion across the site.

After changing Tailwind classes in `index.html` or `script.js`, rebuild CSS:

```bash
npm run build:css
```
