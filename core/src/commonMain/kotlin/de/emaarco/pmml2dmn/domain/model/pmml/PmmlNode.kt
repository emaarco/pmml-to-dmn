package de.emaarco.pmml2dmn.domain.model.pmml

/** A single node of the PMML decision tree. */
data class PmmlNode(
    val id: String?,
    val score: String?,
    val predicate: Predicate?,
    val children: List<PmmlNode>,
)
