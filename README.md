# PMML → DMN Converter

[![CI](https://github.com/emaarco/pmml-to-dmn/actions/workflows/ci.yml/badge.svg)](https://github.com/emaarco/pmml-to-dmn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-Node-3178C6?logo=typescript&logoColor=white)

Convert **PMML decision-tree models** into **DMN decision tables** — as a command-line tool or
directly in your browser. The generated DMN is Camunda-compatible and can be opened, edited and
executed in any DMN engine or visualised and simulated with [dmn-js](https://github.com/bpmn-io/dmn-js).

> **Why this exists.** Machine-learning models are accurate but opaque. A trained decision tree,
> exported as PMML, can be turned into an **explainable DMN decision table** — human-readable rules
> you can review, version, simulate and run in a process engine. This project shows how ML and DMN
> work *together*: ML produces the model, DMN makes the decision explainable.

A modern rewrite of a converter that originally came out of a master's thesis (`assets/thesis.pdf`),
rebuilt as a clean, tested TypeScript project.

## Install / quickstart

Requires **Node.js 20+** (npm ships with Node).

```bash
git clone https://github.com/emaarco/pmml-to-dmn.git
cd pmml-to-dmn
npm install

# build, lint, typecheck, run the architecture gate and all tests
npm run check

# convert a PMML file to DMN
npm run build -w @pmml-to-dmn/cli
node packages/cli/dist/main.js examples/credit-score.pmml -o out.dmn
```

## What you get

- 🌳 Converts PMML `TreeModel` decision trees into DMN decision tables
- 🔢 Simplifies numeric splits into FEEL ranges (`>= 50`, `]10..20]`)
- 🔤 Handles categorical and continuous inputs and a single target
- ♻️ Deterministic output — clean diffs, reviews and golden tests
- 🖥️ **CLI** for scripting and CI
- 🌐 **Browser app** that converts *and simulates* DMN entirely client-side (hostable on GitHub Pages)
- 🧩 Small functional core with an enforced architecture (dependency-cruiser)

### Command line

```bash
node packages/cli/dist/main.js --help
```

Flags: `--model-id`, `--model-name`, `--decision-id`, `--decision-name`, `-o/--output`, and
`--deterministic` (sequential, reproducible element ids).

### Web demo

```bash
npm run dev -w @pmml-to-dmn/web       # local dev server (http://localhost:5173)
npm run build -w @pmml-to-dmn/web     # static site → apps/web/dist
```

Paste or upload a PMML file and hit **Convert** — the DMN is generated in your browser, rendered
with dmn-js, and you can **simulate** concrete inputs (evaluated with [feelin](https://github.com/nikku/feelin))
to see which rule fires. The `pages.yml` workflow publishes the site to GitHub Pages on every push
to `master`.

## Example

Input (`examples/credit-score.pmml`) — a tree splitting on a numeric `score`:

```xml
<Node id="2" score="PASS">
    <SimplePredicate field="score" operator="greaterOrEqual" value="50"/>
</Node>
```

Output (`examples/credit-score.dmn`) — a DMN rule with a FEEL condition:

```xml
<dmn:rule id="DecisionRule_7">
  <dmn:inputEntry id="UnaryTests_5"><dmn:text>&gt;= 50</dmn:text></dmn:inputEntry>
  <dmn:outputEntry id="LiteralExpression_6"><dmn:text>"PASS"</dmn:text></dmn:outputEntry>
</dmn:rule>
```

## Project structure

```
packages/core/   The conversion core (functional pipeline: parse → map → serialize)
packages/cli/    Command-line interface (cac)
apps/web/        Browser app (Vite, dmn-js viewer, feelin simulation)
examples/        Sample PMML input and the DMN it produces
docs/            Architecture, demo walkthrough and blog-post outline
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
