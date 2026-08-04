# Contributing

Thanks for your interest in improving the PMML → DMN converter! 🎉

## Getting started

```bash
git clone https://github.com/emaarco/pmml-to-dmn.git
cd pmml-to-dmn
./gradlew build
```

You need **JDK 21+**. Everything else (Gradle, the Kotlin/JS toolchain, Node) is provisioned by the
Gradle wrapper.

## Project structure

- `core/` — the Kotlin Multiplatform conversion core (JVM + JS). Business logic lives here.
- `cli/` — the command-line adapter.
- `web/` — the browser adapter (static site).

The core uses a hexagonal architecture — read [docs/architecture.md](docs/architecture.md) before
adding features so your change lands in the right layer.

## Before you open a pull request

1. **Format & lint:** `./gradlew ktlintFormat` then `./gradlew ktlintCheck`.
2. **Test everything:** `./gradlew build` (runs JVM *and* JS tests plus the Konsist architecture
   tests).
3. **Add tests** for new behaviour. Conversion logic is covered by unit + golden tests in
   `core/src/commonTest`.
4. **Keep output deterministic.** Generated DMN must stay reproducible; use the
   `SequentialIdGenerator` in tests and update the golden test if output intentionally changes.
5. Use **conventional commit** messages (e.g. `feat: support compound predicates`).

## Adding support for a new PMML feature

Most extensions touch three places:

- the domain model in `core/.../domain/model/pmml`,
- the parser in `core/.../adapter/outbound/xml`,
- the mapping in `core/.../application/service`.

Please describe the PMML feature and add a representative example under `examples/`.

## Questions

Open a [discussion or issue](https://github.com/emaarco/pmml-to-dmn/issues) — happy to help.
