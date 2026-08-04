# PMML → DMN — Codebase Overview (for agents)

Converts PMML decision-tree models into DMN decision tables. Kotlin Multiplatform (JVM + JS),
hexagonal architecture, delivered as a CLI and a static browser app. Package root
`de.emaarco.pmml2dmn`.

## Stack

- Kotlin **2.4.10** (Multiplatform), JDK **21**, Gradle **9.6.1** (wrapper), version catalog
- XML: **xmlutil** core (multiplatform pull parser) for reading PMML; a hand-written deterministic
  serializer for DMN output. **No** javax.xml, **no** Spring.
- CLI: **Clikt**. Web: **kotlinx.html** + Kotlin/JS, dmn-js viewer via CDN.
- Lint: **ktlint** (gradle plugin). Arch tests: **Konsist**.

## Modules

```
core/   Kotlin Multiplatform (jvm + js/nodejs) — the whole conversion
cli/    Kotlin/JVM application (Clikt) — inbound adapter
web/    Kotlin/JS browser app — inbound adapter, builds a static site
examples/  credit-score.pmml + credit-score.dmn
docs/   architecture.md, demo.md, blogpost-outline.md
```

## Hexagonal layers (core, `de.emaarco.pmml2dmn`)

- `domain/` — pure model + logic (pmml + dmn + FEEL conditions). Depends on nothing.
- `application/port/inbound/` — `ConvertPmmlToDmnUseCase` (with nested `Command`).
- `application/port/outbound/` — `PmmlParser`, `DmnSerializer`, `IdGenerator` (interfaces).
- `application/service/` — `ConvertPmmlToDmnService` (implements the use case; does the mapping).
- `adapter/outbound/xml/` — `XmlUtilPmmlParser`, `DmnXmlSerializer`.
- `adapter/outbound/id/` — `SequentialIdGenerator` (deterministic), `UuidIdGenerator` (default).
- `Pmml2Dmn` — composition root (`converter()`, `deterministicConverter()`).

Ports/adapters are split **inbound** vs **outbound** (convention from `emaarco/easy-zeebe`),
enforced by `core/src/jvmTest/.../architecture/HexagonalArchitectureTest.kt` (Konsist).

## Commands

```bash
./gradlew build                 # compile + ktlint + all tests (JVM + JS)
./gradlew :core:jvmTest         # JVM tests incl. Konsist
./gradlew :core:jsNodeTest      # JS tests
./gradlew ktlintFormat          # auto-format
./gradlew :cli:installDist      # runnable CLI at cli/build/install/pmml2dmn/bin/pmml2dmn
./gradlew :web:jsBrowserDistribution        # static site → web/build/dist/js/productionExecutable
./gradlew :web:jsBrowserDevelopmentRun      # local dev server
```

## Conventions & gotchas

- **Determinism matters.** Output must be reproducible; tests use `SequentialIdGenerator` and a
  golden test (`GoldenDmnTest`). Numeric FEEL literals are formatted platform-independently
  (`Double.toFeelString()` — JVM/JS agree on `50.0`).
- Tests live in `core/src/commonTest` (run on JVM **and** JS); Konsist is JVM-only (`jvmTest`).
- ktlint requires the **14.x** gradle plugin for Kotlin 2.4 (older versions break on the KMP module).
- `kotlin-js-store/yarn.lock` is committed (reproducible JS builds); run `kotlinUpgradeYarnLock`
  when JS deps change.
- CI: `.github/workflows/ci.yml` (build/lint/test) and `pages.yml` (deploys the web app to Pages).

## Supported scope

Single `TreeModel`, `SimplePredicate` operators (equal/notEqual/less*/greater*), categorical +
continuous inputs, one target. Unsupported: CompoundPredicate, SimpleSetPredicate, ensembles,
regression/scorecard, multiple models. See README "Supported scope & limitations".
