package de.emaarco.pmml2dmn.domain.model.pmml

import de.emaarco.pmml2dmn.domain.UnsupportedPmmlFeatureException

/** The comparison operators supported inside a [SimplePredicate]. */
enum class ComparisonOperator(
    val pmml: String,
    val feelSymbol: String,
) {
    EQUAL("equal", ""),
    NOT_EQUAL("notEqual", "!="),
    LESS_THAN("lessThan", "<"),
    LESS_OR_EQUAL("lessOrEqual", "<="),
    GREATER_THAN("greaterThan", ">"),
    GREATER_OR_EQUAL("greaterOrEqual", ">="),
    ;

    companion object {
        fun fromPmml(value: String): ComparisonOperator =
            entries.firstOrNull { it.pmml == value }
                ?: throw UnsupportedPmmlFeatureException("Unknown SimplePredicate operator: $value")
    }
}
