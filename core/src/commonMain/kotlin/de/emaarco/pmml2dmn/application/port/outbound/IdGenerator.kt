package de.emaarco.pmml2dmn.application.port.outbound

/** Driven port: generates the element ids used inside the generated DMN model. */
interface IdGenerator {
    /** Returns a new id of the form `"${prefix}_<unique>"`. */
    fun generate(prefix: String): String
}
