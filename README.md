# Marta do Vale — Portfolio Site

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

Runs the CSS build and a syntax check on `script.js`.

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
