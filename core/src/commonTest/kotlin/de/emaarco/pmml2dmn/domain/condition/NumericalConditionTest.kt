package de.emaarco.pmml2dmn.domain.condition

import de.emaarco.pmml2dmn.domain.model.dmn.condition.NumericalCondition
import de.emaarco.pmml2dmn.domain.model.pmml.ComparisonOperator
import de.emaarco.pmml2dmn.domain.model.pmml.SimplePredicate
import kotlin.test.Test
import kotlin.test.assertEquals

class NumericalConditionTest {
    private fun predicate(operator: ComparisonOperator, value: String) =
        SimplePredicate(field = "score", operator = operator, value = value)

    @Test
    fun `single lower bound renders as comparison`() {
        val condition = NumericalCondition(listOf(predicate(ComparisonOperator.GREATER_OR_EQUAL, "50")))
        assertEquals(">= 50.0", condition.getFeelCondition())
    }

    @Test
    fun `single upper bound renders as comparison`() {
        val condition = NumericalCondition(listOf(predicate(ComparisonOperator.LESS_THAN, "50")))
        assertEquals("< 50.0", condition.getFeelCondition())
    }

    @Test
    fun `open interval combines exclusive bounds`() {
        val condition =
            NumericalCondition(
                listOf(
                    predicate(ComparisonOperator.GREATER_THAN, "10"),
                    predicate(ComparisonOperator.LESS_THAN, "20"),
                ),
            )
        assertEquals("]10.0..20.0[", condition.getFeelCondition())
    }

    @Test
    fun `closed interval combines inclusive bounds`() {
        val condition =
            NumericalCondition(
                listOf(
                    predicate(ComparisonOperator.GREATER_OR_EQUAL, "10"),
                    predicate(ComparisonOperator.LESS_OR_EQUAL, "20"),
                ),
            )
        assertEquals("[10.0..20.0]", condition.getFeelCondition())
    }

    @Test
    fun `redundant lower bounds are simplified to the tightest`() {
        val condition =
            NumericalCondition(
                listOf(
                    predicate(ComparisonOperator.GREATER_THAN, "10"),
                    predicate(ComparisonOperator.GREATER_THAN, "30"),
                ),
            )
        assertEquals("> 30.0", condition.getFeelCondition())
    }
}
