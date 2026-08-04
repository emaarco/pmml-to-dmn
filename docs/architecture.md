# Architecture

A small TypeScript monorepo built around a **Functional Core + Imperative Shell**. The converter is
a pure `parse → map → serialize` pipeline; all I/O lives in thin shells (CLI, web). This is simpler
than ports/adapters for a single-capability converter, and idiomatic for the bpmn-io/TS neighbourhood
(dmn-moddle, dmn-js, feelin).

## Workspaces

| Workspace         | Kind             | Responsibility                                            |
|-------------------|------------------|-----------------------------------------------------------|
| `packages/core`   | functional core  | The whole conversion (pure), plus the XML adapters        |
| `packages/cli`    | imperative shell | Command-line interface (cac): reads/writes files          |
| `apps/web`        | imperative shell | Browser app (Vite): DOM, dmn-js viewer, feelin simulation |

The shells depend only on the core's **public API** (`@pmml-to-dmn/core`), never on its internals.

## The core pipeline (`packages/core/src`)

```
model/            Pure domain types (no libs, no I/O): pmml.ts, dmn.ts, errors.ts
parse/            parse-pmml.ts   — PMML string → PmmlModel      (fast-xml-parser)
map/              map-to-dmn.ts   — PmmlModel → DmnModel (leafPaths, rule/condition mapping)
                  conditions.ts   — numerical interval / categorical / empty FEEL builders
serialize/        serialize-dmn.ts — DmnModel → DMN 1.3 XML       (dmn-moddle)
id.ts             IdGenerator (sequential | uuid), injected into the pipeline
convert.ts        convert() / convertDetailed() — composes parse → map → serialize
index.ts          public API
```

`convert.ts` is the only place the stages meet; each stage is independently testable and pure
(except `parse`/`serialize`, which are deterministic transforms over their libraries).

## Enforced boundaries (the architecture gate)

`.dependency-cruiser.cjs` runs in CI (`npm run arch`) and fails the build if:

- **`map/` (the pure transform) imports any vendor or Node built-in** — it may only touch `model/`.
  This protects the core exactly like a hexagonal port, without the interface boilerplate.
- `parse/`, `map/`, `serialize/` depend on each other (they may only depend on `model/`).
- `model/` depends on any other layer (it is a leaf).
- a shell (`cli`/`web`) imports core internals instead of the public entry.
- any circular dependency exists.

Type safety complements this: discriminated unions with exhaustive handling, `readonly` types, and
`strict` + `noUncheckedIndexedAccess` in `tsconfig.base.json`.

## Key design points

- **Deterministic output.** Element ids come from an injected `IdGenerator`. `sequentialIdGenerator()`
  yields byte-identical output, which powers the golden test (`examples/credit-score.dmn`).
- **Spec-valid DMN.** Serialization uses `dmn-moddle`, the same model layer dmn-js uses — the output
  is guaranteed well-formed DMN 1.3.
- **Typed errors.** `PmmlParseError`, `UnsupportedPmmlFeatureError`, `DmnMappingError` (all
  `PmmlToDmnError`).

## Tooling

TypeScript · **npm** workspaces · **tsup** (core/cli build) · **Vite** (web) · **Biome** (lint +
format) · **dependency-cruiser** (architecture) · **Vitest** (tests).

## Extension points

New PMML features slot into the pipeline: extend `model/pmml.ts`, teach `parse/parse-pmml.ts` to read
the new elements, and map them in `map/`. The DMN model and serializer rarely change.
