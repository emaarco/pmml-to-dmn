# Contributing

Thanks for your interest in improving the PMML → DMN converter! 🎉

## Getting started

```bash
git clone https://github.com/emaarco/pmml-to-dmn.git
cd pmml-to-dmn
npm install
npm run check
```

You need **Node.js 20+** (npm ships with Node). `npm run check` runs the whole pipeline: build,
lint, typecheck, the architecture gate and all tests.

## Project structure

- `packages/core/` — the conversion core. A pure **functional pipeline**: `parse → map → serialize`.
- `packages/cli/` — the command-line adapter (an imperative shell).
- `apps/web/` — the browser app (an imperative shell).

Read [docs/architecture.md](docs/architecture.md) before adding features so your change lands in the
right layer. The layering is enforced in CI by **dependency-cruiser** — the pure `map/` stage may
not import any vendor or I/O library.

## Inner loop

```bash
npm test                        # run all tests (Vitest)
npx vitest                      # watch mode
npm run lint                        # Biome (lint + format check)
npm run format                      # Biome autofix
npm run arch                        # dependency-cruiser architecture gate
npm run dev -w @pmml-to-dmn/web   # web dev server
```

## Before you open a pull request

1. `npm run check` passes locally.
2. **Add tests** for new behaviour. Conversion logic is covered by unit + golden tests in
   `packages/core/test`.
3. **Keep output deterministic.** Generated DMN must stay reproducible; pass
   `sequentialIdGenerator()` in tests and update the golden (`examples/credit-score.dmn`) if output
   intentionally changes.
4. Use **conventional commit** messages (e.g. `feat: support compound predicates`).

## Adding support for a new PMML feature

Most extensions touch three files in `packages/core/src`:

- the domain types in `model/`,
- the parser in `parse/parse-pmml.ts`,
- the mapping in `map/map-to-dmn.ts` (and `map/conditions.ts`).

Please add a representative example under `examples/`.

## Questions

Open a [discussion or issue](https://github.com/emaarco/pmml-to-dmn/issues) — happy to help.
