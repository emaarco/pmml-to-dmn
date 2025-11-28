# PMML to DMN Converter

[![Version](https://img.shields.io/badge/version-1.3.2-blue.svg)](https://github.com/emaarco/pmml-to-dmn)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.25-purple.svg)](https://kotlinlang.org/)

> **AI before it was cool.** Converting decision trees into deployable business rules since before everyone had an LLM in their pocket.

## Why This Exists

Remember when "AI" meant decision trees and random forests, not ChatGPT? This tool bridges that era with modern business process automation. It converts **PMML** (Predictive Model Markup Language) decision trees into **DMN** (Decision Model and Notation) format, so you can actually *deploy* your ML models into production BPMN/DMN engines.

### The Problem

You've trained a beautiful decision tree model. Great! Now what? Most ML models sit in Jupyter notebooks gathering digital dust. This tool lets you deploy them where they matter: automating real business decisions in workflow engines.

### The Solution

- **Input**: PMML file containing a decision tree model
- **Output**: DMN decision table ready for deployment on Camunda, Flowable, or any DMN 1.3 compliant engine
- **Magic**: Converts tree logic into FEEL expressions with smart simplifications (e.g., `score > 10 and score <= 20` becomes `[10..20]`)

## Quick Start

### Prerequisites

- Java 21+
- Gradle 8.11+

### Build & Run

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The REST API will be available at `http://localhost:8080`

### API Usage

```bash
POST /api/dmn
Content-Type: multipart/form-data

Parameters:
- pmml-file: Your PMML file (multipart file upload)
- model-id: Unique identifier for the DMN model
- model-name: Human-readable model name
- decision-id: Unique identifier for the decision
- decision-name: Human-readable decision name

Response: DMN XML file
```

**Example with curl:**

```bash
curl -X POST http://localhost:8080/api/dmn \
  -F "pmml-file=@my_decision_tree.pmml" \
  -F "model-id=risk-assessment-v1" \
  -F "model-name=Risk Assessment Model" \
  -F "decision-id=calculate-risk" \
  -F "decision-name=Calculate Credit Risk" \
  > output.dmn
```

## How It Works

1. **Parse PMML**: Extracts decision tree structure, predicates, and leaf outcomes
2. **Build Decision Table**: Converts tree paths into DMN rule rows
3. **Simplify Conditions**: Optimizes numerical ranges into FEEL interval notation
4. **Generate DMN XML**: Creates valid DMN 1.3 XML using pure DOM manipulation

### Smart Simplifications

- `score >= 10 AND score < 20` → `[10..20)`
- `category = "A" OR category = "B"` → preserved as separate rules
- Numeric literals properly formatted for FEEL expressions

## Project Structure

```
src/main/kotlin/de/emaarco/pmmltodmn/
├── api/              # REST controller
├── domain/
│   ├── facade/       # Orchestration layer
│   ├── model/        # Domain models (PMML, DMN)
│   ├── parser/       # PMML XML parsing
│   └── transformer/  # PMML → DMN conversion
└── util/             # XML helpers, ID generators
```

## Testing

```bash
# Run all tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```

## Version History

- **v1.3.2**: Simplified DMN model using numeric intervals
- **v1.3.1**: Fixed simplification edge cases for `>` and `<` operators
- **v1.3**: Introduced FEEL range notation for cleaner decision tables
- **v1.2.1**: Enhanced XML parsing error handling
- **v1.2.0**: Initial DMN model simplification

## Tech Stack

- **Kotlin** - Because Java ceremonies are so 2015
- **Spring Boot** - REST API with minimal fuss
- **Pure DOM** - No external DMN libraries, just XML craftsmanship
- **JUnit 5** - Testing (there's always room for more!)

## Contributing

Found a bug? Have a feature idea? PRs welcome! This is a living project that proves "old school" ML still has a place in modern automation.

---

*Built with ☕ by developers who remember when AI meant something other than text completion.*
