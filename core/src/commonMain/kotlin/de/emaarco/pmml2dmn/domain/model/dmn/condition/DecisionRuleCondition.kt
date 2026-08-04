package de.emaarco.pmml2dmn.domain.model.dmn.condition

/**
 * A single input attribute of a decision-table rule.
 * Can consist of several PMML predicates that are combined into one FEEL expression.
 */
abstract class DecisionRuleCondition {
    /** The condition of the decision-rule input, expressed in the FEEL language. */
    abstract fun getFeelCondition(): String
}
