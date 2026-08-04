package de.emaarco.pmml2dmn.domain.model.pmml

/** A `<MiningField>` from the PMML mining schema. */
data class MiningField(
    val name: String,
    val usageType: String?,
)
