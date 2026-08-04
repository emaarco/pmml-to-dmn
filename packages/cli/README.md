# @pmml-to-dmn/cli

The **command-line interface** — an imperative shell around [@pmml-to-dmn/core](../core) for
converting PMML files to DMN from a terminal or CI. Built with [cac](https://github.com/cacjs/cac).

## Layout

- `src/main.ts` — CLI entry point: argument/flag parsing, reads input, writes output.
- `src/convert-file.ts` — thin glue between the file system and the pure `core` pipeline.

## Usage

```bash
npm run build -w @pmml-to-dmn/cli
node packages/cli/dist/main.js examples/credit-score.pmml -o out.dmn
node packages/cli/dist/main.js --help
```

Flags: `--model-id`, `--model-name`, `--decision-id`, `--decision-name`, `-o/--output`, and
`--deterministic` (sequential, reproducible element ids — handy for golden tests and clean diffs).

The published binary is exposed as `pmml2dmn`.

## Notes

All conversion logic lives in `core`; this package only handles I/O and argument parsing. As an
imperative shell it must not import core internals — use the public API. Enforced by the
architecture gate (`npm run arch`). See the [root README](../../README.md) for the full picture.
