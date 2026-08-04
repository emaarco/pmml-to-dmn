package de.emaarco.pmml2dmn

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ConvertPmmlToDmnServiceTest {
    @Test
    fun `converts the credit-score tree into the expected DMN`() {
        val dmn = Pmml2Dmn.deterministicConverter().convert(creditScoreCommand())

        // model + decision metadata come from the command
        assertContainsAll(
            dmn,
            "id=\"credit-risk-v1\"",
            "name=\"Credit Risk Model\"",
            "id=\"assess-risk\"",
            "name=\"Assess Credit Risk\"",
        )

        // one input column for 'score', one output column for 'result'
        assertContainsAll(
            dmn,
            "<input id=\"Input_2\" label=\"score\">",
            "typeRef=\"integer\" expressionLanguage=\"feel\"",
            "<text>score</text>",
            "<output id=\"Output_4\" name=\"result\" typeRef=\"string\" />",
        )

        // both rules with their FEEL conditions (comparison operators are XML-escaped)
        assertContainsAll(
            dmn,
            "<text>&gt;= 50.0</text>",
            "<text>\"PASS\"</text>",
            "<text>&lt; 50.0</text>",
            "<text>\"FAIL\"</text>",
        )
    }

    @Test
    fun `deterministic converter produces byte-identical output`() {
        val first = Pmml2Dmn.deterministicConverter().convert(creditScoreCommand())
        val second = Pmml2Dmn.deterministicConverter().convert(creditScoreCommand())
        assertEquals(first, second)
    }

    private fun assertContainsAll(actual: String, vararg fragments: String) {
        fragments.forEach { fragment ->
            assertTrue(actual.contains(fragment), "Expected DMN to contain:\n$fragment\n\nActual:\n$actual")
        }
    }
}
