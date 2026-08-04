# Bruno smoke tests

A small [Bruno](https://www.usebruno.com/) collection that smoke-tests the deployed web app.

> **Scope:** this checks **availability/deployment** — the site is served. It does **not** exercise
> the in-browser conversion (Bruno issues HTTP requests, it does not run browser JavaScript).
> Conversion correctness is covered by the test suite in `packages/core/test` (unit, parser,
> end-to-end and golden tests).

## Requests

- **Site is served** — `GET /` returns 200 and the HTML shell (`#app`, the title).

## Environments

- **Local** — `http://localhost:5173` (run `npm run dev -w @pmml-to-dmn/web` first; adjust the
  port if Vite picks another).
- **GitHub Pages** — the deployed site (update the URL once Pages is enabled).

## Run

Open the folder in the Bruno app, or run headless with the Bruno CLI:

```bash
npx --yes @usebruno/cli run --env Local
```
