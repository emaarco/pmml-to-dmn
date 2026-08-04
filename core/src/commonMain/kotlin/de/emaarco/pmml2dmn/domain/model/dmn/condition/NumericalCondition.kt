package de.emaarco.pmml2dmn.domain.model.dmn.condition

import de.emaarco.pmml2dmn.domain.DmnMappingException
import de.emaarco.pmml2dmn.domain.model.pmml.SimplePredicate
import de.emaarco.pmml2dmn.domain.toFeelString

/**
 * A numerical condition of a decision-table rule, e.g. `X > 10`, `X < 10` or the
 * interval `[0..10]`. Overlapping/redundant bounds along a tree path are simplified into a
 * single FEEL range.
 */
class NumericalCondition(
    predicates: List<SimplePredicate>,
) : DecisionRuleCondition() {
    private val conditions: List<Pair<String, Double>>

    init {
        val rawConditions = mapConditions(predicates)
        val groupedConditions = groupByComparator(rawConditions)
        this.conditions = simplifyConditions(groupedConditions)
    }

    override fun getFeelCondition(): String =
        when {
            conditions.size == 1 -> "${conditions[0].first} ${conditions[0].second.toFeelString()}"
            conditions.size > 1 -> conditions.joinToString("..") { getDisjunctionCondition(it) }
            else -> throw DmnMappingException("No numerical condition found")
        }

    // -------------------------- private helper methods --------------------------

    private fun mapConditions(predicates: List<SimplePredicate>): List<Pair<String, Double>> =
        predicates.map { predicate ->
            Pair(predicate.operator.feelSymbol, predicate.value.toDouble())
        }

    private fun groupByComparator(conditions: List<Pair<String, Double>>): Map<String, List<Double>> =
        conditions.groupBy({
            it.first
        }) { it.second }

    /** Remove conditions that exclude each other / are redundant. */
    private fun simplifyConditions(conditions: Map<String, List<Double>>): List<Pair<String, Double>> {
        val requiredConditions: MutableList<Pair<String, Double>> = ArrayList()
        val boundaryConditions = getBoundaryConditions(conditions)
        getLowerLimitOfInterval(boundaryConditions)?.let { requiredConditions.add(it) }
        getUpperLimitOfInterval(boundaryConditions)?.let { requiredConditions.add(it) }
        return requiredConditions.sortedBy { it.second }
    }

    private fun getBoundaryConditions(conditions: Map<String, List<Double>>): Map<String, Double> {
        val boundaryConditions: MutableMap<String, Double> = HashMap()
        conditions.forEach { (comparator, values) ->
            boundaryConditions[comparator] = getBoundaryCondition(comparator, values)
        }
        return boundaryConditions
    }

    /** Get 'MIN' or 'MAX' value depending on the comparator. */
    private fun getBoundaryCondition(comparator: String, values: List<Double>): Double =
        if (comparator == ">" || comparator == ">=") {
            values.maxOrNull() ?: throw DmnMappingException("Cannot determine 'max' value of provided list")
        } else {
            values.minOrNull() ?: throw DmnMappingException("Cannot determine 'min' value of provided list")
        }

    private fun getUpperLimitOfInterval(conditions: Map<String, Double>): Pair<String, Double>? {
        val upperLimit = conditions.filterKeys { key -> key.contains(">") }.maxByOrNull { it.value }
        return upperLimit?.let { Pair(it.key, it.value) }
    }

    private fun getLowerLimitOfInterval(conditions: Map<String, Double>): Pair<String, Double>? {
        val lowerLimit = conditions.filterKeys { key -> key.contains("<") }.minByOrNull { it.value }
        return lowerLimit?.let { Pair(it.key, it.value) }
    }

    private fun getDisjunctionCondition(condition: Pair<String, Double>): String {
        val value = condition.second.toFeelString()
        return when (condition.first) {
            ">=" -> "[$value"
            ">" -> "]$value"
            "<=" -> "$value]"
            "<" -> "$value["
            else -> throw DmnMappingException("Operator ${condition.first} not supported as numerical operator")
        }
    }
}
