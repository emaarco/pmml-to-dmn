package de.emaarco.pmml2dmn.adapter.outbound.id

import de.emaarco.pmml2dmn.application.port.outbound.IdGenerator
import kotlin.uuid.Uuid

/**
 * Default [IdGenerator] producing random, collision-free ids (`Input_<32 hex chars>`),
 * using the multiplatform [Uuid] with its hyphens stripped.
 */
class UuidIdGenerator : IdGenerator {
    override fun generate(prefix: String): String = "${prefix}_${Uuid.random().toHexString()}"
}
