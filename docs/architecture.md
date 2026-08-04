# Architecture

The converter is a **Kotlin Multiplatform** project with a hexagonal core and thin, per-target
entry points. The package convention (ports/adapters split into *inbound* and *outbound*) follows
[`emaarco/easy-zeebe`](https://github.com/emaarco/easy-zeebe).

## Modules

| Module  | Target       | Responsibility                                              |
|---------|--------------|------------------------------------------------------------|
| `core`  | JVM + JS     | The whole conversion: domain, ports, application, adapters |
| `cli`   | JVM          | Inbound adapter: command-line interface (Clikt)            |
| `web`   | JS (browser) | Inbound adapter: static browser app (kotlinx.html)         |

`cli` and `web` depend only on the core's inbound port; they never touch the domain internals.

## Hexagonal layers (in `core`, package `de.emaarco.pmml2dmn`)

```
domain/                        Pure domain model + logic (no XML, no framework). Depends on nothing.
  model/pmml/                  PmmlModel, PmmlNode, Predicate, DataField, MiningField, tree paths
  model/dmn/                   DmnDefinitions ... + FEEL condition builders
application/
  port/inbound/                ConvertPmmlToDmnUseCase        (driving port)
  port/outbound/               PmmlParser, DmnSerializer, IdGenerator   (driven ports)
  service/                     ConvertPmmlToDmnService        (implements the use case)
adapter/
  outbound/xml/                XmlUtilPmmlParser, DmnXmlSerializer      (driven adapters, xmlutil)
  outbound/id/                 SequentialIdGenerator, UuidIdGenerator
  inbound/…                    lives in :cli and :web
```

The composition root `Pmml2Dmn` wires the service with concrete outbound adapters. It is the only
place that knows every layer; entry points use `Pmml2Dmn.converter()`.

### Enforced rules (Konsist)

`core/src/jvmTest/.../architecture/HexagonalArchitectureTest.kt` fails the build if:

- `domain` depends on any other layer,
- ports/adapters cross the inbound/outbound boundary,
- a port is not an interface, or an application class is not named `*Service`.

## Conversion pipeline

```
PMML string
  └─ PmmlParser (xmlutil pull parser)         → PmmlModel (tree)
       └─ ConvertPmmlToDmnService
            ├─ PmmlModel.leafPaths()          → one rule per root→leaf path
            ├─ condition builders             → FEEL unary tests (intervals, quoted categoricals)
            └─ IdGenerator                    → element ids
       └─ DmnSerializer (deterministic)       → DMN XML string
```

Key design points:

- **DOM-free & multiplatform.** Parsing uses xmlutil's pull parser; serialization is a small,
  deterministic string builder with XML escaping. Both run on JVM and JS.
- **Determinism.** Element ids come from an injectable `IdGenerator`. `SequentialIdGenerator`
  yields byte-identical output, which powers golden tests and clean diffs. Numeric FEEL literals
  are formatted platform-independently so JVM and JS agree (`50` → `50.0`).
- **Typed errors.** `PmmlParseException`, `UnsupportedPmmlFeatureException` and
  `DmnMappingException` (all `PmmlToDmnException`) replace generic runtime failures.

## Extension points

New PMML features slot in behind the existing ports: extend the `domain/model/pmml` model, teach
`XmlUtilPmmlParser` to read the new elements, and map them in `ConvertPmmlToDmnService`. The DMN
output model and serializer rarely need to change.
