package de.emaarco.pmml2dmn.adapter.outbound.id

import de.emaarco.pmml2dmn.application.port.outbound.IdGenerator

/**
 * Deterministic [IdGenerator] that numbers ids sequentially (`Input_1`, `Input_2`, ...).
 * Produces reproducible, byte-identical DMN output — used for tests and golden files.
 */
class SequentialIdGenerator : IdGenerator {
    private var counter = 0

    override fun generate(prefix: String): String = "${prefix}_${++counter}"
}
