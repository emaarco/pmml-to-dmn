# @pmml-to-dmn/core

The conversion **core** — a pure functional pipeline that turns a PMML decision tree into a
DMN decision table. No CLI, no I/O concerns beyond XML: this is the reusable engine behind the
[CLI](../cli) and the [web app](../../apps/web).

## Pipeline

```
PMML XML → parse → PmmlModel → map → DmnModel → serialize → DMN XML
```

- `PmmlToDmnConverter.ts` — composes the pipeline. `index.ts` is the public API.
- `model/` — pure domain types (`pmml.ts`, `dmn.ts`, `errors.ts`). Leaf: no libraries, no I/O.
- `parse/PmmlParser.ts` — PMML XML → `PmmlModel` (fast-xml-parser).
- `map/DmnMapper.ts` + `map/FeelConditionBuilder.ts` — `PmmlModel` → `DmnModel` (pure; simplifies
  numeric splits into FEEL ranges like `>= 50`, `]10..20]`).
- `serialize/DmnSerializer.ts` — `DmnModel` → spec-valid DMN 1.3 XML (dmn-moddle, **async**).
- `ids/` — `RandomIdGenerator` (default) or `SequentialIdGenerator` (deterministic).
- `utils/parseHitPolicy.ts` — turns an untrusted string into a `HitPolicy`.

## Usage

```ts
import { PmmlToDmnConverter } from '@pmml-to-dmn/core'

const converter = new PmmlToDmnConverter() // { deterministicIds: true } for reproducible ids
const { xml, model } = await converter.convert(pmmlXml, {
  modelId: 'credit-risk-v1',
  modelName: 'Credit Risk Model',
  decisionId: 'assess-risk',
  decisionName: 'Assess Credit Risk',
  hitPolicy: 'UNIQUE', // optional: UNIQUE | FIRST | ANY, defaults to FIRST
}) // async: serialization is async; model is the structured DmnModel
```

## Notes

- **Functional core:** `map/` is pure and imports no vendor/Node module. Pipeline stages never
  import each other, and `model/` stays a leaf. Enforced by the architecture gate
  (`npm run arch`) — keep new code inside these boundaries.
- **Classes first:** behaviour lives in classes; pure helpers live in `utils/`, one per file.
- **Deterministic output** with `deterministicIds: true` — used by the golden test
  (`examples/credit-score.dmn`); regenerate the golden if output intentionally changes.

## Supported scope

Single PMML `TreeModel`, `SimplePredicate` operators (`equal`, `notEqual`, `lessThan`,
`lessOrEqual`, `greaterThan`, `greaterOrEqual`), categorical + continuous inputs, one target.
Not (yet): `CompoundPredicate`, `SimpleSetPredicate`, ensembles, regression/scorecard, multiple
models. See the [root README](../../README.md) for the full picture.
