package de.emaarco.pmml2dmn.domain.model.dmn

/** The single `<output>` column header. */
data class OutputColumn(
    val id: String,
    val name: String,
    val typeRef: String,
)
