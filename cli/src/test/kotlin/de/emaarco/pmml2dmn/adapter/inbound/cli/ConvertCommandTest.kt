package de.emaarco.pmml2dmn.adapter.inbound.cli

import com.github.ajalt.clikt.testing.test
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ConvertCommandTest {
    private val examplePmml = File("../examples/credit-score.pmml")

    @Test
    fun `converts a PMML file and writes DMN to stdout`() {
        val result = ConvertCommand().test(listOf(examplePmml.path, "--deterministic"))

        assertEquals(0, result.statusCode, result.output)
        assertTrue(result.output.contains("<definitions"), result.output)
        assertTrue(result.output.contains("<text>&gt;= 50.0</text>"), result.output)
        assertTrue(result.output.contains("<text>\"PASS\"</text>"), result.output)
    }

    @Test
    fun `writes DMN to an output file when requested`() {
        val out = File.createTempFile("credit-score", ".dmn").apply { deleteOnExit() }
        val result =
            ConvertCommand().test(
                listOf(examplePmml.path, "-o", out.path, "--deterministic", "--model-id", "m1"),
            )

        assertEquals(0, result.statusCode, result.output)
        val dmn = out.readText()
        assertTrue(dmn.contains("id=\"m1\""), dmn)
        assertTrue(dmn.contains("<decisionTable"), dmn)
    }

    @Test
    fun `fails with a clear error on invalid PMML`() {
        val broken =
            File.createTempFile("broken", ".pmml").apply {
                writeText("not pmml")
                deleteOnExit()
            }
        val result = ConvertCommand().test(listOf(broken.path))
        assertTrue(result.statusCode != 0)
    }
}
