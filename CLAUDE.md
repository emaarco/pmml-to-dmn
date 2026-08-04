# PMML → DMN — Codebase Overview (for agents)

Converts PMML decision-tree models into DMN decision tables. TypeScript / Node, delivered as a CLI
and a static browser app. Architecture: **Functional Core + Imperative Shell** (not hexagonal).

## Stack

- **TypeScript** (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), **Node 20+**
- **npm** workspaces (`save-exact`), monorepo
- Build: **tsup** (core/cli) · **Vite** (web). Lint/format: **Biome**. Tests: **Vitest**.
- Architecture gate: **dependency-cruiser** (`.dependency-cruiser.cjs`) — the Konsist replacement.
- XML: **fast-xml-parser** (parse) + **dmn-moddle** (serialize, spec-valid DMN 1.3).
- Web viewer/sim: **dmn-js** + **feelin**.

## Workspaces

```
packages/core/   functional pipeline: parse → map → serialize (pure), plus XML adapters
packages/cli/    CLI (cac) — imperative shell
apps/web/        Vite browser app — imperative shell (dmn-js + feelin simulation)
examples/        credit-score.pmml + credit-score.dmn (golden)
docs/            architecture.md
```

## Core layout (`packages/core/src`, functional core)

- `model/` — pure types (`pmml.ts`, `dmn.ts`, `errors.ts`). Leaf; no libs/I/O.
- `parse/parse-pmml.ts` — PMML → `PmmlModel` (fast-xml-parser).
- `map/map-to-dmn.ts` + `map/conditions.ts` — `PmmlModel` → `DmnModel` (pure; interval simplification).
- `serialize/serialize-dmn.ts` — `DmnModel` → DMN XML (dmn-moddle, async).
- `id.ts` — `IdGenerator` (`sequentialIdGenerator` deterministic, `uuidIdGenerator` default).
- `convert.ts` — `convert()` / `convertDetailed()` compose the pipeline. `index.ts` = public API.

## Commands

```bash
npm install
npm run check          # build + biome + typecheck + arch (dependency-cruiser) + vitest  — the full gate
npm test           # vitest
npm run arch           # architecture gate only
npm run format         # biome autofix
npm run build -w @pmml-to-dmn/cli && node packages/cli/dist/main.js examples/credit-score.pmml --deterministic
npm run dev -w @pmml-to-dmn/web     # web dev server (localhost:5173)
npm run build -w @pmml-to-dmn/web   # static site → apps/web/dist
```

## Conventions & gotchas

- **Architecture safety is enforced, not manual.** `npm run arch` fails if the pure `map/` stage imports
  any vendor/Node module, if pipeline stages import each other, if `model/` is not a leaf, or if a
  shell imports core internals. Keep new code inside these boundaries.
- **Determinism matters.** Output must be reproducible; tests use `sequentialIdGenerator()` and a
  golden file (`examples/credit-score.dmn`). Regenerate the golden if output intentionally changes.
- FEEL numbers render naturally (`>= 50`, not `50.0`).
- dmn-moddle serialization is **async** → `convert()` is async.
- Versions are exact-pinned (`save-exact`); run `npm install` after changing deps.
- CI: `.github/workflows/ci.yml` runs `npm run check`; `pages.yml` builds `apps/web` and deploys to Pages.
  Pushing workflow files needs a token with the `workflow` OAuth scope.

## Supported scope

Single `TreeModel`, `SimplePredicate` operators (equal/notEqual/less*/greater*), categorical +
continuous inputs, one target. Unsupported: CompoundPredicate, SimpleSetPredicate, ensembles,
regression/scorecard, multiple models. See README "Supported scope & limitations".
