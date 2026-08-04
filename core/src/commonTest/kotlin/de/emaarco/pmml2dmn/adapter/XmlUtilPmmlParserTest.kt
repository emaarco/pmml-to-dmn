package de.emaarco.pmml2dmn.adapter

import de.emaarco.pmml2dmn.CREDIT_SCORE_PMML
import de.emaarco.pmml2dmn.adapter.outbound.xml.XmlUtilPmmlParser
import de.emaarco.pmml2dmn.domain.PmmlParseException
import de.emaarco.pmml2dmn.domain.model.pmml.SimplePredicate
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class XmlUtilPmmlParserTest {
    private val parser = XmlUtilPmmlParser()

    @Test
    fun `parses data dictionary and mining schema`() {
        val model = parser.parse(CREDIT_SCORE_PMML)

        assertEquals(listOf("score", "result"), model.dataFields.map { it.name })
        assertEquals("continuous", model.dataFields.first { it.name == "score" }.opType)
        assertEquals("result", model.targetFieldName())
        assertEquals(listOf("score"), model.nonTargetFields().map { it.name })
    }

    @Test
    fun `builds the tree and its leaf paths excluding the root`() {
        val model = parser.parse(CREDIT_SCORE_PMML)

        val paths = model.leafPaths()
        assertEquals(2, paths.size)
        // each leaf path contains a single decision node carrying a SimplePredicate on score
        paths.forEach { path ->
            assertEquals(1, path.size)
            val predicate = path.single().predicate
            assertTrue(predicate is SimplePredicate && predicate.field == "score")
        }
        assertEquals(listOf("PASS", "FAIL"), paths.map { it.last().score })
    }

    @Test
    fun `fails clearly on malformed input`() {
        assertFailsWith<PmmlParseException> {
            parser.parse("not xml at all <<<")
        }
    }
}
