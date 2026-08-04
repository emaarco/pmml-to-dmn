package de.emaarco.pmml2dmn.domain.model.pmml

/** A `<DataField>` from the PMML data dictionary. */
data class DataField(
    val name: String,
    val dataType: String,
    val opType: String,
)
