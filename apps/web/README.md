# @pmml-to-dmn/web

The **browser app** — an imperative shell that converts *and simulates* PMML entirely client-side.
Upload a PMML file, get a DMN table rendered read-only, then run concrete inputs to see which rule
fires. No server, no install. Built with [Vite](https://vitejs.dev) around
[@pmml-to-dmn/core](../../packages/core).

**[Live demo →](https://emaarco.github.io/pmml-to-dmn/)**

## Layout

- `src/main.ts` — app entry: upload handling, calls `core.convert()`, wires up the viewer/simulation.
- `src/sample.ts` — bundled sample PMML for a one-click demo.
- `src/styles.css` — styling (Geist variable font).
- `index.html` · `vite.config.ts` — Vite host page and build config.
- `public/` — static assets (favicons, touch icon).

## Stack

- [dmn-js](https://github.com/bpmn-io/dmn-js) — read-only DMN viewer.
- [@emaarco/dmn-js-simulation](https://github.com/emaarco/dmn-js-simulation) — evaluate concrete
  inputs and highlight the firing rule (FEEL via feelin).

## Commands

```bash
npm run dev -w @pmml-to-dmn/web       # local dev server (http://localhost:5173)
npm run build -w @pmml-to-dmn/web     # static site → apps/web/dist
```

## Notes

Conversion runs fully in the browser via `core`; as an imperative shell this app uses the public
API only (enforced by `npm run arch`). The `pages.yml` workflow publishes the site to GitHub Pages
on every push to `master`. See the [root README](../../README.md) for the full picture.
