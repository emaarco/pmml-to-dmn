# Bruno smoke tests

A small [Bruno](https://www.usebruno.com/) collection that smoke-tests the deployed web app.

> **Scope:** this checks **availability/deployment** — the site is served and the compiled
> Kotlin/JS bundle loads. It does **not** exercise the in-browser conversion (Bruno issues HTTP
> requests, it does not run browser JavaScript). Conversion correctness is covered by the
> multiplatform test suite in `core/src/commonTest` (unit, parser, end-to-end and golden tests).

## Requests

- **Site is served** — `GET /` returns 200 and the HTML shell (`#app`, the bundle script, the title).
- **App bundle is served** — `GET /pmml2dmn.js` returns 200 with a JavaScript content type.

## Environments

- **Local** — `http://localhost:8080` (run `./gradlew :web:jsBrowserDevelopmentRun` first; adjust the
  port if your dev server uses another).
- **GitHub Pages** — the deployed site (update the URL once Pages is enabled).

## Run

Open the folder in the Bruno app, or run headless with the Bruno CLI:

```bash
npx --yes @usebruno/cli run --env Local
```
