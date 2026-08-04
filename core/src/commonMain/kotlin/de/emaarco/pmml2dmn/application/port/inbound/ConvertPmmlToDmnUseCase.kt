package de.emaarco.pmml2dmn.application.port.inbound

/** Driving port: convert a PMML decision-tree document into a DMN model (as XML). */
interface ConvertPmmlToDmnUseCase {
    /** Converts the given [command] and returns the serialized DMN XML. */
    fun convert(command: Command): String

    /** Input for the conversion: the raw PMML plus the metadata for the DMN model. */
    data class Command(
        val pmml: String,
        val modelId: String,
        val modelName: String,
        val decisionId: String,
        val decisionName: String,
    )
}
