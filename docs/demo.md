# Demo: from ML model to explainable decision

This walkthrough shows the end-to-end story: a machine-learning decision tree (PMML) becomes an
explainable DMN decision table that you can inspect and simulate.

## 1. Start with a PMML decision tree

A classic ML pipeline (scikit-learn, R, KNIME, SPSS, …) can export a trained decision tree as PMML.
We use a minimal credit-scoring tree, [`examples/credit-score.pmml`](../examples/credit-score.pmml):
if `score >= 50` the applicant passes, otherwise they fail.

## 2. Convert to DMN

```bash
./gradlew :cli:installDist
./cli/build/install/pmml2dmn/bin/pmml2dmn examples/credit-score.pmml \
  --deterministic \
  --model-id credit-risk-v1 --model-name "Credit Risk Model" \
  --decision-id assess-risk --decision-name "Assess Credit Risk" \
  -o examples/credit-score.dmn
```

The result, [`examples/credit-score.dmn`](../examples/credit-score.dmn), is a DMN decision table
with two rules — the ML split `score >= 50` becomes the FEEL condition `>= 50.0`.

## 3. Inspect & simulate the decision

- Open `examples/credit-score.dmn` in the [web demo](../README.md#web-demo) or in the Camunda
  Modeler / any dmn-js based viewer.
- Provide an input (e.g. `score = 72`) and watch the engine pick the matching rule and return
  `"PASS"`. This is the part a raw ML model can't give you: a transparent, auditable decision path.

## 4. The point

> **ML produces the model; DMN makes the decision logic explainable.**

The same tree that lived inside an opaque model is now human-readable rules — reviewable by domain
experts, versionable in git, and executable in a process engine. That is where ML and DMN complement
rather than compete with each other.

## Try your own

Export any single-tree PMML `TreeModel` and drop it into the CLI or the web app. See the
[supported scope](../README.md#supported-scope--limitations) for what works today.
