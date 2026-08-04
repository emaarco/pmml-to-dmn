# PMML → DMN Converter

[![CI](https://github.com/emaarco/pmml-to-dmn/actions/workflows/ci.yml/badge.svg)](https://github.com/emaarco/pmml-to-dmn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Kotlin Multiplatform](https://img.shields.io/badge/Kotlin-Multiplatform-7F52FF?logo=kotlin&logoColor=white)

Convert **PMML decision-tree models** into **DMN decision tables** — as a command-line tool or
directly in your browser. The generated DMN is Camunda-compatible and can be opened, edited and
executed in any DMN engine or visualised with [dmn-js](https://github.com/bpmn-io/dmn-js).

> **Why this exists.** Machine-learning models are accurate but opaque. A trained decision tree,
> exported as PMML, can be turned into an **explainable DMN decision table** — human-readable rules
> you can review, version, simulate and run in a process engine. Unlike a raw model behind an API,
> the decision logic becomes transparent. This project shows how ML and DMN work *together*: ML
> produces the model, DMN makes the decision explainable.

A modern rewrite of a converter that originally came out of a master's thesis (`assets/thesis.pdf`),
rebuilt as a clean, tested, multiplatform open-source project.

## Install / quickstart

Requires **JDK 21+**. Everything else (Gradle, the Kotlin/JS toolchain, Node) comes via the wrapper.

```bash
git clone https://github.com/emaarco/pmml-to-dmn.git
cd pmml-to-dmn

# build, lint and test everything (JVM + JS)
./gradlew build

# convert a PMML file to DMN
./gradlew :cli:installDist
./cli/build/install/pmml2dmn/bin/pmml2dmn examples/credit-score.pmml -o out.dmn
```

## What you get

- 🌳 Converts PMML `TreeModel` decision trees into DMN decision tables
- 🔢 Simplifies numeric splits into FEEL ranges (`>= 50`, `]10..20]`)
- 🔤 Handles categorical and continuous inputs and a single target
- ♻️ Deterministic output — clean diffs, reviews and golden tests
- 🖥️ **CLI** for scripting and CI
- 🌐 **Static web app** that runs entirely in the browser (hostable on GitHub Pages)
- 🧩 Kotlin Multiplatform core (JVM + JS), no framework lock-in

### Command line

```bash
./cli/build/install/pmml2dmn/bin/pmml2dmn --help
```

Flags: `--model-id`, `--model-name`, `--decision-id`, `--decision-name`, `-o/--output`, and
`--deterministic` (sequential, reproducible element ids).

### Web demo

```bash
./gradlew :web:jsBrowserDevelopmentRun        # local dev server with hot reload
./gradlew :web:jsBrowserDistribution          # static site → web/build/dist/js/productionExecutable
```

Paste or upload a PMML file, hit **Convert**, and the DMN is generated in your browser; when the
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

## Project structure

```
core/      Kotlin Multiplatform conversion core (JVM + JS)
cli/       Command-line interface (Kotlin/JVM, Clikt)
web/       Static browser app (Kotlin/JS, kotlinx.html, dmn-js viewer)
examples/  Sample PMML input and the DMN it produces
docs/      Architecture, demo walkthrough and blog-post outline
```

See [docs/architecture.md](docs/architecture.md) for the design.

## Supported scope & limitations

**Supported:** a single PMML `TreeModel`, `DataDictionary`/`MiningSchema`, tree `Node`s with
`SimplePredicate` (`equal`, `notEqual`, `lessThan`, `lessOrEqual`, `greaterThan`,
`greaterOrEqual`), categorical and continuous inputs, one target field.

**Not (yet) supported:** `CompoundPredicate`, `SimpleSetPredicate`, `True`/`False` as real
predicates, model ensembles/segmentation, regression and scorecard models, multiple models per
file. The architecture leaves room to add these.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). Use the issue forms to report a
[bug](.github/ISSUE_TEMPLATE/fix.yml), request a
[feature](.github/ISSUE_TEMPLATE/feat.yml), or propose a
[refactor](.github/ISSUE_TEMPLATE/refactor.yml).

## License

[MIT](LICENSE) © 2026 Marco Schaeck
