# PMML → DMN Converter

Convert **PMML decision-tree models** into **DMN decision tables** — as a command-line tool or
directly in your browser. The generated DMN is Camunda-compatible and can be opened, edited and
executed in any DMN engine or visualised with [dmn-js](https://github.com/bpmn-io/dmn-js).

> **Why?** Machine-learning models are often opaque. A trained decision tree, exported as PMML, can
> be turned into an **explainable DMN decision table** — human-readable rules you can review,
> simulate and run in a process engine. This project shows how ML and DMN can work *together*: ML
> produces the model, DMN makes the decision logic transparent.

This is a modern rewrite of a converter that originally came out of a master's thesis (see
`assets/thesis.pdf`), rebuilt as a clean, tested, multiplatform open-source project.

## Features

- 🌳 Converts PMML `TreeModel` decision trees into DMN decision tables
- 🔢 Simplifies numeric splits into FEEL ranges (e.g. `>= 50`, `]10..20]`)
- 🔤 Handles categorical and continuous inputs and a single target
- ♻️ Deterministic output (great for diffs, reviews and golden tests)
- 🖥️ **CLI** for scripting and CI
- 🌐 **Static web app** that runs entirely in the browser (hostable on GitHub Pages)
- 🧩 Kotlin Multiplatform core (JVM + JS), hexagonal architecture, no framework lock-in

## Project layout

```
core/      Kotlin Multiplatform conversion core (domain, ports, adapters) — JVM + JS
cli/       Command-line interface (Kotlin/JVM, Clikt)
web/       Static browser app (Kotlin/JS, kotlinx.html, dmn-js viewer)
examples/  Sample PMML input and the DMN it produces
docs/      Architecture, demo walkthrough and blog-post outline
```

The core follows a **hexagonal architecture** with ports and adapters split into *inbound*
(driving) and *outbound* (driven) — see [docs/architecture.md](docs/architecture.md). The
boundaries are enforced by [Konsist](https://docs.konsist.lemonappdev.com/) architecture tests.

## Requirements

- JDK 21+
- No local Gradle needed — use the included wrapper (`./gradlew`)

## Build & test

```bash
./gradlew build        # compile, lint (ktlint) and run all tests (JVM + JS)
./gradlew ktlintCheck  # lint only
./gradlew :core:allTests
```

## Command-line usage

```bash
# Install a runnable distribution
./gradlew :cli:installDist

# Convert a PMML file to DMN (writes to stdout, or to a file with -o)
./cli/build/install/pmml2dmn/bin/pmml2dmn examples/credit-score.pmml -o out.dmn

# See all options
./cli/build/install/pmml2dmn/bin/pmml2dmn --help
```

Useful flags: `--model-id`, `--model-name`, `--decision-id`, `--decision-name`, and
`--deterministic` (sequential, reproducible element ids).

## Web demo

```bash
# Run locally with hot reload
./gradlew :web:jsBrowserDevelopmentRun

# Or build the static site (deployable to GitHub Pages)
./gradlew :web:jsBrowserDistribution
# output: web/build/dist/js/productionExecutable
```

Paste or upload a PMML file, hit **Convert**, and the DMN is generated in your browser. When the
dmn-js viewer is available it also renders the decision table. The `pages.yml` workflow publishes
this site to GitHub Pages on every push to `master`.

## Example

Input (`examples/credit-score.pmml`) — a tree splitting on a numeric `score`:

```xml
<Node id="2" score="PASS">
    <SimplePredicate field="score" operator="greaterOrEqual" value="50"/>
</Node>
```

Output (`examples/credit-score.dmn`) — a DMN rule with a FEEL condition:

```xml
<rule id="DecisionRule_7">
  <inputEntry id="UnaryTests_5"><text>&gt;= 50.0</text></inputEntry>
  <outputEntry id="LiteralExpression_6"><text>"PASS"</text></outputEntry>
</rule>
```

## Supported scope & limitations

**Supported:** a single PMML `TreeModel`, `DataDictionary`/`MiningSchema`, tree `Node`s with
`SimplePredicate` (`equal`, `notEqual`, `lessThan`, `lessOrEqual`, `greaterThan`,
`greaterOrEqual`), categorical and continuous inputs, one target field.

**Not (yet) supported:** `CompoundPredicate`, `SimpleSetPredicate`, `True`/`False` as real
predicates (the root `<True/>` is treated as the tree root), model ensembles/segmentation,
regression and scorecard models, and multiple models per file. The architecture leaves room to add
these behind the existing ports.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Please note the
[Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2026 Marco Schaeck
