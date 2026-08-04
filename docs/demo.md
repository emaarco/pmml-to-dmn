# Demo: from ML model to explainable decision

This walkthrough shows the end-to-end story: a machine-learning decision tree (PMML) becomes an
explainable DMN decision table that you can inspect **and simulate**.

## 1. Start with a PMML decision tree

A classic ML pipeline (scikit-learn, R, KNIME, SPSS, …) can export a trained decision tree as PMML.
We use a minimal credit-scoring tree, [`examples/credit-score.pmml`](../examples/credit-score.pmml):
if `score >= 50` the applicant passes, otherwise they fail.

## 2. Convert to DMN

```bash
npm run build -w @pmml-to-dmn/cli
node packages/cli/dist/main.js examples/credit-score.pmml \
  --deterministic \
  --model-id credit-risk-v1 --model-name "Credit Risk Model" \
  --decision-id assess-risk --decision-name "Assess Credit Risk" \
  -o examples/credit-score.dmn
```

The result, [`examples/credit-score.dmn`](../examples/credit-score.dmn), is a DMN decision table
with two rules — the ML split `score >= 50` becomes the FEEL condition `>= 50`.

## 3. Inspect & simulate the decision

Open the web app:

```bash
npm run dev -w @pmml-to-dmn/web   # http://localhost:5173
```

- The generated DMN is rendered with **dmn-js**.
- In the **Simulate** panel, enter `score = 72` and the rule `>= 50 → "PASS"` fires — evaluated
  in-browser with [feelin](https://github.com/nikku/feelin). This is the part a raw ML model can't
  give you: a transparent, auditable decision path.

You can also open `examples/credit-score.dmn` in the Camunda Modeler or any dmn-js based tool.

## 4. The point

> **ML produces the model; DMN makes the decision logic explainable.**

The same tree that lived inside an opaque model is now human-readable rules — reviewable by domain
experts, versionable in git, and executable in a process engine. That is where ML and DMN complement
rather than compete with each other.

## Try your own

Export any single-tree PMML `TreeModel` and drop it into the CLI or the web app. See the
[supported scope](../README.md#supported-scope--limitations) for what works today.
