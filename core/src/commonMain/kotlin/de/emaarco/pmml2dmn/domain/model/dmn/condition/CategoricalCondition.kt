package de.emaarco.pmml2dmn.domain.model.dmn.condition

/**
 * A single categorical condition of a decision-table rule, e.g. `WEATHER == SUNNY`.
 * The value is wrapped in quotes to form a FEEL string literal.
 */
class CategoricalCondition(
    private val value: String,
) : DecisionRuleCondition() {
    override fun getFeelCondition(): String = "\"$value\""
}
