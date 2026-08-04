package de.emaarco.pmml2dmn.domain.model.dmn

/** A DMN `<decision>` backed by a single decision table. */
data class Decision(
    val id: String,
    val name: String,
    val table: DecisionTable,
)
