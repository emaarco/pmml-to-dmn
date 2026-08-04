package de.emaarco.pmml2dmn.application.port.outbound

import de.emaarco.pmml2dmn.domain.model.pmml.PmmlModel

/** Driven port: parse a raw PMML document into the internal [PmmlModel]. */
interface PmmlParser {
    fun parse(pmml: String): PmmlModel
}
