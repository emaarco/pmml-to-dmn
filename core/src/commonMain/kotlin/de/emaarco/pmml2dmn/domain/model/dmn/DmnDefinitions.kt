package de.emaarco.pmml2dmn.domain.model.dmn

/** Root of the generated DMN model (`<definitions>`). */
data class DmnDefinitions(
    val id: String,
    val name: String,
    val decision: Decision,
)
