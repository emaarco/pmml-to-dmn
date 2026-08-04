package de.emaarco.pmml2dmn.adapter.inbound.cli

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.core.CliktError
import com.github.ajalt.clikt.core.Context
import com.github.ajalt.clikt.parameters.arguments.argument
import com.github.ajalt.clikt.parameters.options.default
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.option
import com.github.ajalt.clikt.parameters.types.file
import de.emaarco.pmml2dmn.Pmml2Dmn
import de.emaarco.pmml2dmn.application.port.inbound.ConvertPmmlToDmnUseCase
import de.emaarco.pmml2dmn.domain.PmmlToDmnException

/**
 * Inbound (driving) CLI adapter: reads a PMML file, converts it via the [ConvertPmmlToDmnUseCase]
 * and writes the resulting DMN model to a file or stdout.
 */
class ConvertCommand : CliktCommand(name = "pmml2dmn") {
    override fun help(context: Context) =
        "Convert a PMML decision-tree model into a DMN decision table."

    private val input by argument(name = "pmml", help = "Path to the PMML input file")
        .file(mustExist = true, canBeDir = false, mustBeReadable = true)

    private val output by option("-o", "--output", help = "DMN output file (defaults to stdout)")
        .file(canBeDir = false)

    private val modelId by option("--model-id", help = "id of the generated DMN model")
        .default("pmml-to-dmn")

    private val modelName by option("--model-name", help = "name of the generated DMN model")
        .default("PMML to DMN")

    private val decisionId by option("--decision-id", help = "id of the generated decision")
        .default("decision")

    private val decisionName by option("--decision-name", help = "name of the generated decision")
        .default("Decision")

    private val deterministic by option("--deterministic", help = "use sequential (reproducible) element ids")
        .flag()

    override fun run() {
        val command =
            ConvertPmmlToDmnUseCase.Command(
                pmml = input.readText(),
                modelId = modelId,
                modelName = modelName,
                decisionId = decisionId,
                decisionName = decisionName,
            )

        val converter = if (deterministic) Pmml2Dmn.deterministicConverter() else Pmml2Dmn.converter()

        val dmn =
            try {
                converter.convert(command)
            } catch (ex: PmmlToDmnException) {
                throw CliktError("Conversion failed: ${ex.message}")
            }

        val target = output
        if (target == null) {
            echo(dmn, trailingNewline = false)
        } else {
            target.writeText(dmn)
            echo("Wrote DMN model to ${target.path}")
        }
    }
}
