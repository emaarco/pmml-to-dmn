# PMML → DMN Converter

[![Live demo](https://img.shields.io/badge/Live%20demo-emaarco.github.io-2ea44f?logo=githubpages&logoColor=white)](https://emaarco.github.io/pmml-to-dmn/)
[![CI](https://github.com/emaarco/pmml-to-dmn/actions/workflows/ci.yml/badge.svg)](https://github.com/emaarco/pmml-to-dmn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-Node-3178C6?logo=typescript&logoColor=white)

Convert **PMML decision-tree models** into **DMN decision tables** — as a command-line tool or
directly in your browser. The generated DMN is Camunda-compatible and can be opened, edited and
executed in any DMN engine or visualised and simulated with [dmn-js](https://github.com/bpmn-io/dmn-js).

**[Try the web app →](https://emaarco.github.io/pmml-to-dmn/)** — convert and simulate PMML entirely in your browser, no install required.

A modern rewrite of a converter that originally came out of a
[master's thesis 📄](assets/thesis.pdf), rebuilt as a clean, tested TypeScript project.

## Classic ML meets DMN

PMML (Predictive Model Markup Language) is the interchange format for **classic, pre-deep-learning
machine learning** — decision trees, regressions, scorecards. A model learned from data is accurate,
but it ships as an opaque artifact you can only *run*: hard to read, audit or adjust by hand.

DMN is the opposite — **decision logic that people author and own**: explicit rules you can read,
version, govern and execute in a process engine. The trade-off is that you have to write those rules
yourself.

Converting a PMML decision tree into a DMN table bridges the two: the model *learns* the logic, DMN
makes it *explicit*. It turns the usual "AI vs. rules" framing into **AI → rules** — keep the pattern
the model found, but as transparent, testable, governable decisions.

|           | Classic ML (PMML)                 | DMN                                    |
| --------- | --------------------------------- | -------------------------------------- |
| Origin    | Learned from data                 | Authored by people                     |
| Strength  | Finds complex patterns, adapts    | Transparent, auditable, easy to change |
| Weakness  | Opaque, hard to govern            | You must know the rules up front       |
| Best when | Patterns are unknown, data-driven | Logic must be explainable and owned    |

**Sweet spot:** train the model with ML, then ship and govern it as DMN — and use
[dmn-js-simulation](https://github.com/emaarco/dmn-js-simulation) to watch exactly how each input
reaches its output.

## Where a PMML model comes from

You don't write PMML by hand — you train a model in your usual ML tool and **export** it. Most
tools ship a PMML exporter:

- **KNIME** — build a tree with *Decision Tree Learner*, then wire it into the *PMML Writer* node (no code)
- **scikit-learn** (Python) — wrap a `DecisionTreeClassifier` in a `PMMLPipeline` and call
  [`sklearn2pmml`](https://github.com/jpmml/sklearn2pmml)
- **R** — the [`pmml`](https://cran.r-project.org/package=pmml) package exports an `rpart` tree
- **Spark MLlib / SPSS / SAS** — native PMML export

This converter expects a **`TreeModel`** (see [scope](#supported-scope--limitations)), so train a
*decision tree* rather than a random forest or regression. `examples/credit-score.pmml` is a ready
sample to try first.

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

There are two ways to use it: from the **command line** (great for scripting and CI) or via the
**web module** in your browser (great for exploring and simulating).

### Use via command line

```bash
node packages/cli/dist/main.js --help
```

Flags: `--model-id`, `--model-name`, `--decision-id`, `--decision-name`, `-o/--output`, and
`--deterministic` (sequential, reproducible element ids).

### Use via web module

Live at **[emaarco.github.io/pmml-to-dmn](https://emaarco.github.io/pmml-to-dmn/)** — or run it locally:

```bash
npm run dev -w @pmml-to-dmn/web       # local dev server (http://localhost:5173)
npm run build -w @pmml-to-dmn/web     # static site → apps/web/dist
```

**Upload** a PMML file (drag-and-drop or picker) and it's converted in your browser and rendered
read-only with dmn-js. **Simulate** concrete inputs with
[dmn-js-simulation](https://github.com/emaarco/dmn-js-simulation) to see which rule fires, then
download the DMN. The `pages.yml` workflow publishes the site to GitHub Pages on every push to
`master`.

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
apps/web/        Browser app (Vite, read-only dmn-js viewer + dmn-js-simulation)
examples/        Sample PMML input and the DMN it produces
docs/            Architecture notes
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
