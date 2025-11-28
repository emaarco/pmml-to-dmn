# PMML to DMN - Codebase Overview

## Project Summary

**Name**: PMML to DMN Converter  
**Version**: 1.3.2  
**Package**: `de.emaarco.pmmltodmn`  
**Description**: Converts decision trees from PMML (Predictive Model Markup Language) format into DMN (Decision Model and Notation) models that can be deployed on DMN or BPMN engines.

## Technology Stack

- **Language**: Kotlin 1.6.10
- **JVM Target**: Java 11
- **Framework**: Spring Boot 2.6.2
- **Build Tool**: Gradle (Kotlin DSL)
- **Testing**: JUnit 5
- **XML Processing**: DOM (javax.xml.parsers, javax.xml.transform)
- **Serialization**: Jackson (Kotlin module)
- **Port**: 8085 (configured in application.properties)

## Build & Execution Commands

```bash
# Build project
./gradlew build

# Run tests
./gradlew test

# Run application
./gradlew bootRun

# Clean build
./gradlew clean build
```

## Directory Structure

```
src/main/kotlin/de/emaarco/pmmltodmn/
├── PmmlToDmnApplication.kt          # Spring Boot entry point
├── api/
│   └── DmnController.kt             # REST API endpoint
├── domain/
│   ├── facade/
│   │   └── DmnFacade.kt            # Orchestrates PMML->DMN conversion
│   ├── model/
│   │   ├── dmn/                    # DMN output model classes
│   │   │   ├── Decision.kt
│   │   │   ├── DecisionRule.kt
│   │   │   ├── DecisionTable.kt
│   │   │   ├── DmnModel.kt
│   │   │   ├── DmnModelRequest.kt
│   │   │   ├── InputAttributes.kt
│   │   │   ├── OutputAttribute.kt
│   │   │   └── condition/          # FEEL condition builders
│   │   │       ├── CategoricalCondition.kt
│   │   │       ├── DecisionRuleCondition.kt
│   │   │       ├── EmptyCondition.kt
│   │   │       └── NumericalCondition.kt
│   │   └── tree/                   # PMML input model classes
│   │       ├── DataField.kt
│   │       ├── MiningField.kt
│   │       ├── TreeDictionary.kt
│   │       ├── TreeInfo.kt
│   │       ├── TreePaths.kt
│   │       └── TreeTarget.kt
│   ├── service/
│   │   ├── DecisionTreeService.kt  # PMML parsing & extraction
│   │   └── DmnModelService.kt      # DMN model building & serialization
│   └── utils/
│       ├── AttributeUtils.kt       # Name formatting utilities
│       ├── IdUtils.kt              # UUID generation
│       └── NodeUtils.kt            # DOM traversal helpers

src/test/kotlin/de/emaarco/pmmltodmn/
└── PmmlToDmnApplicationTests.kt     # Basic context load test (minimal)

src/main/resources/
└── application.properties           # Server port (8085)
```

## Architecture & Design Patterns

### Layered Architecture

1. **API Layer** (`api/`)
   - `DmnController`: REST endpoint at `/api/dmn`
   - Accepts: multipart PMML file + model metadata
   - Returns: XML-serialized DMN model

2. **Domain Layer** (`domain/`)
   - **Facade Pattern** (`DmnFacade`): Orchestrates the conversion workflow
   - **Service Layer**:
     - `DecisionTreeService`: Parses PMML XML, extracts tree structure
     - `DmnModelService`: Builds DMN XML model from parsed tree
   - **Model Classes**: Domain objects representing PMML and DMN structures

3. **Utility Layer** (`utils/`)
   - `NodeUtils`: XML DOM traversal helpers
   - `IdUtils`: Random UUID generation (removes hyphens)
   - `AttributeUtils`: Lowercase + underscore variable naming

### Data Flow

```
HTTP POST (PMML file)
    ↓
DmnController
    ↓
DmnFacade.buildDmnModel()
    ├→ DecisionTreeService.extractDecisionTreeFromPmml()
    │    └→ TreeDictionary, TreePaths (parse PMML structure)
    │    └→ TreeInfo (encapsulates extracted data)
    ↓
DmnModelService.buildDmnTable()
    ├→ DmnModel (create DMN root definitions)
    ├→ Decision (create decision element)
    ├→ DecisionTable (create table structure)
    ├→ InputAttributes (header: input columns)
    ├→ OutputAttribute (header: output column)
    ├→ DecisionRule + Conditions (data rows with FEEL expressions)
    ↓
XML Transformation
    ↓
ByteArrayResource (HTTP response)
```

## Key Components

### Input Processing (PMML)
- **TreeDictionary**: Extracts DataFields and MiningFields from PMML
- **TreePaths**: Recursively traverses Node elements to build all paths (root→leaf)
- **TreeInfo**: Container holding dictionary and all tree paths

### Output Generation (DMN)
- **DmnModel**: Root `<definitions>` element with namespaces and metadata
- **Decision**: `<decision>` element with ID and name
- **DecisionTable**: `<decisionTable>` containing rules and headers
- **InputAttributes/OutputAttribute**: Table header definitions
- **DecisionRule**: Single rule row with conditions and output
- **Conditions** (polymorphic):
  - `CategoricalCondition`: Categorical values → quoted string (e.g., `"SUNNY"`)
  - `NumericalCondition`: Numeric ranges → FEEL intervals (e.g., `[10..20]`)
  - `EmptyCondition`: No condition (catch-all)

### FEEL Expression Generation
- Numerical conditions automatically simplify to intervals:
  - `>`, `>=` bounds become lower limits
  - `<`, `<=` bounds become upper limits
  - Combined into FEEL range notation: `[10..20]`, `]10..20[`, etc.
- Categorical conditions wrapped in quotes

## API Endpoint

```
POST /api/dmn

Parameters:
  - pmml-file (multipart): The PMML decision tree file
  - model-id (query): ID for the output DMN model
  - model-name (query): Human-readable name for the model
  - decision-id (query): ID for the decision element
  - decision-name (query): Human-readable name for the decision

Response:
  - Content-Type: application/xml
  - Body: XML-serialized DMN model
```

## Important Code Patterns & Conventions

1. **Kotlin Objects as Singletons**: `NodeUtils`, `IdUtils`, `AttributeUtils` use object declarations
2. **Data Classes**: Used for simple DTOs (`DataField`, `DmnModelRequest`, `TreeInfo`)
3. **Init Blocks**: Heavy use of init blocks in model classes for side-effects (DOM building)
4. **XML DOM Construction**: Direct DOM manipulation rather than templating/serialization libraries
5. **Error Handling**: RuntimeException for parsing/validation failures (could be improved)
6. **Naming Convention**: 
   - Camel case for variables
   - Lowercase with underscores for FEEL variable names
   - Random UUID-based IDs for XML elements

## Recent Development History

| Version | Change |
|---------|--------|
| 1.3.2   | Simplify DMN Model (use numeric intervals) |
| 1.3.1   | Cannot simplify from > and < to >= and <= |
| 1.3     | Simplify conditions of decision-table (use FEEL-range) |
| 1.2.1   | Return error if xml cannot be parsed |
| 1.2.0   | Simplify dmn-model |
| 1.1.0   | Provide id's & names of dmn-model attributes |
| 1.0.2   | Replace remaining java- with kotlin-functions |

## Testing Status

- **Current**: Minimal test coverage (only context load test)
- **Todo**: Test coverage for decision tree extraction and DMN model generation
- **Tool Reference**: TODO in tests mentions dmn-js from bpmn.io toolkit

## Development Notes

1. **XML Parsing**: Uses standard javax.xml.parsers with DocumentBuilderFactory
2. **Exception Handling**: Errors during parsing throw RuntimeException with message
3. **ID Generation**: Uses UUID.randomUUID() with hyphens stripped
4. **No Dependencies** on external DMN libraries - pure DOM manipulation
5. **Condition Simplification**: Latest versions implement intelligent numeric interval simplification

## Future Enhancements (From Code Inspection)

- Comprehensive unit and integration tests needed
- Consider error response codes and detailed error messages
- Explore DMN visualization (referenced dmn-js)
- Consider supporting more complex PMML features

## Configuration Files

- `build.gradle.kts`: Full build configuration with Spring Boot and Kotlin plugins
- `settings.gradle.kts`: Minimal (just root project name)
- `gradle/wrapper/`: Gradle 7.x wrapper
- `.gitignore`: Standard Gradle/IDE ignores
- No .cursor rules or .github copilot instructions configured

