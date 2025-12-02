# PMML to DMN Converter

> **AI before the current hype.**
> Converting decision trees into deployable DMN business rules.

## 🤔 Why This Exists

This tool bridges machine learning with business process automation. It converts **PMML** (Predictive Model Markup
Language) decision trees into **DMN** (Decision Model and Notation) format, so you can actually *deploy* your ML models
into production BPMN/DMN engines.

Built as part of my 2021 master's thesis on integrating AI into BPMN processes:

**📄 Full Thesis**: [Download PDF](assets/thesis.pdf)

**🔗 Related Project**: [bpmn-and-ai](https://github.com/emaarco/bpmn-and-ai)

## 🚫 The Problem

You've trained a beautiful decision tree model. Great! Now what?
Many ML models sit in tools like [Knime](https://www.knime.com/) gathering digital dust.
This tool lets you deploy them where they matter:
automating real business decisions in workflow engines.

## ✅ The Solution

- **Input**: PMML file containing a decision tree model
- **Output**: DMN decision table ready for deployment on Camunda, Flowable, or any DMN 1.3 compliant engine
- **Magic**: Converts tree logic into FEEL expressions with smart simplifications (e.g., `score > 10 and score <= 20`
  becomes `]10..20]`)

## 🔍 More on the topic

The work in this thesis explored integrating AI decision-making
into structured business processes—patterns that share
conceptual similarities with what's now being marketed
as ["agentic AI"](https://camunda.com/resources/what-is-agentic-ai/)
in the BPMN/workflow automation space.

While the terminology has evolved, the core idea remains relevant:
embedding intelligent, automated decision-making capabilities
within business process engines like Camunda.

## 🚀 Quick Start

### 📋 Prerequisites

- Java 21+
- Gradle 8.11+

### 🔨 Build & Run

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The REST API will be available at `http://localhost:8085`

### 📡 API Usage

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
curl -X POST http://localhost:8085/api/dmn \
  -F "pmml-file=@my_decision_tree.pmml" \
  -F "model-id=risk-assessment-v1" \
  -F "model-name=Risk Assessment Model" \
  -F "decision-id=calculate-risk" \
  -F "decision-name=Calculate Credit Risk" \
  > output.dmn
```

## ⚙️ How It Works

1. **Parse PMML**: Extracts decision tree structure, predicates, and leaf outcomes
2. **Build Decision Table**: Converts tree paths into DMN rule rows
3. **Simplify Conditions**: Optimizes numerical ranges into FEEL interval notation
4. **Generate DMN XML**: Creates valid DMN 1.3 XML using pure DOM manipulation

### 🧠 Smart Simplifications

- `score >= 10 AND score < 20` → `[10..20)`
- `category = "A" OR category = "B"` → preserved as separate rules
- Numeric literals properly formatted for FEEL expressions

## 🛠️ Tech Stack

- **Kotlin** - Because Java ceremonies are so 2015
- **Spring Boot** - REST API with minimal fuss
- **Pure DOM** - No external DMN libraries, just XML craftsmanship

---

*Built during countless hours of thesis writing 🎓*