package de.emaarco.pmml2dmn.domain.model.dmn

/** A DMN `<decisionTable>` with its input/output headers and rules. */
data class DecisionTable(
    val id: String,
    val inputs: List<InputColumn>,
    val output: OutputColumn,
    val rules: List<DmnRule>,
)
