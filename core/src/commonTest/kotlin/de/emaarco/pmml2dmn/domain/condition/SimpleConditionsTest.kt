package de.emaarco.pmml2dmn.domain.condition

import de.emaarco.pmml2dmn.domain.model.dmn.condition.CategoricalCondition
import de.emaarco.pmml2dmn.domain.model.dmn.condition.EmptyCondition
import kotlin.test.Test
import kotlin.test.assertEquals

class SimpleConditionsTest {
    @Test
    fun `categorical condition wraps value in quotes`() {
        assertEquals("\"SUNNY\"", CategoricalCondition("SUNNY").getFeelCondition())
    }

    @Test
    fun `empty condition renders as empty string`() {
        assertEquals("", EmptyCondition().getFeelCondition())
    }
}
