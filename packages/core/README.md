# @pmml-to-dmn/core

The conversion **core** — a pure functional pipeline that turns a PMML decision tree into a
DMN decision table. No CLI, no I/O concerns beyond XML: this is the reusable engine behind the
[CLI](../cli) and the [web app](../../apps/web).

## Pipeline

```
PMML XML → parse → PmmlModel → map → DmnModel → serialize → DMN XML
```

- `model/` — pure domain types (`pmml.ts`, `dmn.ts`, `errors.ts`). Leaf: no libraries, no I/O.
- `parse/parse-pmml.ts` — PMML XML → `PmmlModel` (fast-xml-parser).
- `map/map-to-dmn.ts` + `map/conditions.ts` — `PmmlModel` → `DmnModel` (pure; simplifies numeric
  splits into FEEL ranges like `>= 50`, `]10..20]`).
- `serialize/serialize-dmn.ts` — `DmnModel` → spec-valid DMN 1.3 XML (dmn-moddle, **async**).
- `id.ts` — `IdGenerator`: `uuidIdGenerator` (default) or `sequentialIdGenerator` (deterministic).
- `convert.ts` — `convert()` / `convertDetailed()` compose the pipeline. `index.ts` is the public API.

## Usage

```ts
import { convert } from '@pmml-to-dmn/core'

const dmnXml = await convert(pmmlXml) // async: serialization is async
```

## Notes

- **Functional core:** `map/` is pure and imports no vendor/Node module. Pipeline stages never
  import each other, and `model/` stays a leaf. Enforced by the architecture gate
  (`npm run arch`) — keep new code inside these boundaries.
- **Deterministic output** with `sequentialIdGenerator()` — used by the golden test
  (`examples/credit-score.dmn`); regenerate the golden if output intentionally changes.

## Supported scope

Single PMML `TreeModel`, `SimplePredicate` operators (`equal`, `notEqual`, `lessThan`,
`lessOrEqual`, `greaterThan`, `greaterOrEqual`), categorical + continuous inputs, one target.
Not (yet): `CompoundPredicate`, `SimpleSetPredicate`, ensembles, regression/scorecard, multiple
models. See the [root README](../../README.md) for the full picture.
