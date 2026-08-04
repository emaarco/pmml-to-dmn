package de.emaarco.pmml2dmn.domain.model.dmn.condition

/**
 * An empty condition of a decision-table rule
 * (used when a specific input attribute is not relevant for a rule).
 */
class EmptyCondition : DecisionRuleCondition() {
    override fun getFeelCondition(): String = ""
}
