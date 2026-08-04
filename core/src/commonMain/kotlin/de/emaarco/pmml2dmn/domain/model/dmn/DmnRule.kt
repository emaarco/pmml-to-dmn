package de.emaarco.pmml2dmn.domain.model.dmn

/** A single `<rule>` row: one input entry per input column plus one output entry. */
data class DmnRule(
    val id: String,
    val inputEntries: List<InputEntry>,
    val outputEntry: OutputEntry,
)
