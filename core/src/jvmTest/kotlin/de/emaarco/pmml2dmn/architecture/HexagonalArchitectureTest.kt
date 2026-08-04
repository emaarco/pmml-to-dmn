package de.emaarco.pmml2dmn.architecture

import com.lemonappdev.konsist.api.Konsist
import com.lemonappdev.konsist.api.architecture.KoArchitectureCreator.assertArchitecture
import com.lemonappdev.konsist.api.architecture.Layer
import com.lemonappdev.konsist.api.declaration.KoInterfaceDeclaration
import com.lemonappdev.konsist.api.verify.assertTrue
import kotlin.test.Test
import kotlin.test.assertTrue as ktAssertTrue

/**
 * Enforces the hexagonal architecture of the conversion core (package convention modelled on
 * `emaarco/easy-zeebe`): ports and adapters are strictly split into inbound (driving) and
 * outbound (driven), the domain depends on nothing, and application services orchestrate ports.
 */
class HexagonalArchitectureTest {
    private val root = "de.emaarco.pmml2dmn"

    // Konsist does not pick up KMP `commonMain` automatically, so scope the source dir explicitly.
    private fun coreScope() = Konsist.scopeFromDirectory("core/src/commonMain/kotlin")

    @Test
    fun `source is discovered`() {
        ktAssertTrue(coreScope().files.toList().isNotEmpty(), "Konsist found no core source files")
    }

    @Test
    fun `hexagonal layering is respected`() {
        // The core module holds the domain, ports, application services and the outbound
        // (driven) adapters. Inbound (driving) adapters live in the :cli and :web modules.
        coreScope().assertArchitecture {
            val domain = Layer("Domain", "$root.domain..")
            val inboundPorts = Layer("InboundPorts", "$root.application.port.inbound..")
            val outboundPorts = Layer("OutboundPorts", "$root.application.port.outbound..")
            val application = Layer("Application", "$root.application.service..")
            val outboundAdapters = Layer("OutboundAdapters", "$root.adapter.outbound..")

            domain.dependsOnNothing()
            inboundPorts.dependsOn(domain)
            outboundPorts.dependsOn(domain)
            application.dependsOn(domain, inboundPorts, outboundPorts)
            outboundAdapters.dependsOn(domain, outboundPorts)
        }
    }

    @Test
    fun `all ports are interfaces`() {
        coreScope()
            .classesAndInterfacesAndObjects(includeNested = false, includeLocal = false)
            .filter { it.resideInPackage("$root.application.port..") }
            .assertTrue { it is KoInterfaceDeclaration }
    }

    @Test
    fun `application services are named with the Service suffix`() {
        coreScope()
            .classes()
            .filter { it.resideInPackage("$root.application.service..") }
            .assertTrue { it.hasNameEndingWith("Service") }
    }
}
