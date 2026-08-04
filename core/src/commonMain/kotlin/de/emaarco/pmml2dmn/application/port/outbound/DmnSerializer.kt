package de.emaarco.pmml2dmn.application.port.outbound

import de.emaarco.pmml2dmn.domain.model.dmn.DmnDefinitions

/** Driven port: serialize the internal [DmnDefinitions] into a DMN XML document. */
interface DmnSerializer {
    fun serialize(definitions: DmnDefinitions): String
}
