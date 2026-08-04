# Blog-post outline

Working title: **"Making machine learning explainable with DMN: from PMML to a decision table"**

## Core message

ML and DMN are often framed as competitors. They are complementary: a trained model captures
*what* to decide from data; DMN expresses *why* in transparent, executable rules. Converting a PMML
decision tree into a DMN decision table gives you the best of both — data-driven and explainable.

## Suggested structure

1. **Hook** — "When does AI pay off, and when is DMN the better tool?" The honest answer: it
   depends, and they work well together.
2. **The problem** — ML decision trees are accurate but opaque; stakeholders can't review or audit
   an in-memory model.
3. **The bridge** — PMML is the portable export format for ML models; DMN is the standard for
   business decision logic. Both are XML; a tree maps naturally onto a decision table.
4. **Demo** — walk through [docs/demo.md](demo.md): PMML in → DMN out → simulate a concrete input
   in the browser (screenshots of the web app + dmn-js viewer).
5. **How it works** — decision-tree paths become rules, numeric splits become FEEL ranges,
   categoricals become quoted literals. Link [docs/architecture.md](architecture.md).
6. **Honest limits** — what PMML we support today and what we don't (see README). Set expectations.
7. **Call to action** — try the hosted web demo, run the CLI on your own model, contribute a PMML
   feature.

## Assets to prepare

- Screenshot of the web app converting the sample and rendering the decision table
- The before/after XML snippet (PMML split → DMN rule)
- A short GIF of simulating `score = 72` → `PASS`

## Distribution ideas

- Cross-post to the Miragon blog / dev.to / Medium
- Tie in with the DMN-Simulation tooling as a companion piece
