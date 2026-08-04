package de.emaarco.pmml2dmn.domain.model.dmn

/** A single `<input>` column header. */
data class InputColumn(
    val id: String,
    val inputExpressionId: String,
    val label: String,
    val typeRef: String,
    val expressionText: String,
)
