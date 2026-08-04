package de.emaarco.pmml2dmn

import de.emaarco.pmml2dmn.adapter.outbound.id.SequentialIdGenerator
import de.emaarco.pmml2dmn.adapter.outbound.id.UuidIdGenerator
import de.emaarco.pmml2dmn.adapter.outbound.xml.DmnXmlSerializer
import de.emaarco.pmml2dmn.adapter.outbound.xml.XmlUtilPmmlParser
import de.emaarco.pmml2dmn.application.port.inbound.ConvertPmmlToDmnUseCase
import de.emaarco.pmml2dmn.application.port.outbound.IdGenerator
import de.emaarco.pmml2dmn.application.service.ConvertPmmlToDmnService

/**
 * Composition root: wires the conversion use case with its concrete outbound adapters.
 * This is the single place that knows all layers; entry points (CLI, web) depend only on
 * the resulting [ConvertPmmlToDmnUseCase].
 */
object Pmml2Dmn {
    /**
     * Creates a converter.
     *
     * @param idGenerator strategy for DMN element ids. Defaults to random ids; pass a
     *   [SequentialIdGenerator] for deterministic, reproducible output.
     */
    fun converter(idGenerator: IdGenerator = UuidIdGenerator()): ConvertPmmlToDmnUseCase =
        ConvertPmmlToDmnService(
            parser = XmlUtilPmmlParser(),
            serializer = DmnXmlSerializer(),
            idGenerator = idGenerator,
        )

    /** Convenience converter that produces deterministic output (sequential ids). */
    fun deterministicConverter(): ConvertPmmlToDmnUseCase = converter(SequentialIdGenerator())
}
