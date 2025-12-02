package de.emaarco.pmmltodmn.domain.model.dmn.condition

import de.emaarco.pmmltodmn.domain.utils.NodeUtils
import org.w3c.dom.Node

/**
 * A single condition of a decision-table rule, based on numerical values
 * e.g. 'X > 10' or 'X < 10' or '[0..10]'
 */
class NumericalCondition(nodes: List<Node>) : DecisionRuleCondition() {

    private val conditions: List<Pair<String, Double>>

    init {
        val rawConditions = mapConditions(nodes)
        val groupedConditions = groupByComparator(rawConditions)
        this.conditions = simplifyConditions(groupedConditions)
    }

    override fun getFeelCondition(): String {
        return if (conditions.size == 1) {
            "${conditions[0].first} ${conditions[0].second}"
        } else if (conditions.size > 1) {
            conditions.joinToString("..") { getDisjunctionCondition(it) }
        } else {
            throw RuntimeException("No condition found!")
        }
    }

    /* -------------------------- private helper methods -------------------------- */

    private fun mapConditions(nodes: List<Node>): List<Pair<String, Double>> {
        return nodes.map { node ->
            val conditionNode = NodeUtils.getConditionOfTreeNode(node)
            val rawCompareOperator = NodeUtils.getValueOfNodeAttribute(conditionNode, "operator")
            val value = NodeUtils.getValueOfNodeAttribute(conditionNode, "value")
            Pair(mapCompareOperator(rawCompareOperator), value.toDouble())
        }
    }

    /**
     * Group all conditions by their comparator
     */
    private fun groupByComparator(conditions: List<Pair<String, Double>>): Map<String, List<Double>> {
        return conditions.groupBy({ it.first }) { it.second }
    }

    /**
     * Remove conditions that exclude each other / are redundant
     */
    private fun simplifyConditions(conditions: Map<String, List<Double>>): List<Pair<String, Double>> {
        val requiredConditions: MutableList<Pair<String, Double>> = ArrayList();
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

    /**
     * Get 'MIN' or 'MAX' value depending on the comparator
     */
    private fun getBoundaryCondition(comparator: String, values: List<Double>): Double {
        return if (comparator == ">" || comparator == ">=") {
            values.maxOrNull() ?: throw RuntimeException("Cannot determine 'max' value of provided list")
        } else {
            values.minOrNull() ?: throw RuntimeException("Cannot determine 'min' value of provided list")
        }
    }

    private fun getUpperLimitOfInterval(conditions: Map<String, Double>): Pair<String, Double>? {
        val upperLimit = conditions.filterKeys { key -> key.contains(">") }.maxByOrNull { it.value }
        return upperLimit?.let { Pair(it.key, it.value) }
    }

    private fun getLowerLimitOfInterval(conditions: Map<String, Double>): Pair<String, Double>? {
        val lowerLimit = conditions.filterKeys { key -> key.contains("<") }.minByOrNull { it.value }
        return lowerLimit?.let { Pair(it.key, it.value) }
    }

    private fun mapCompareOperator(comparator: String): String {
        return when (comparator) {
            "equal" -> "" // ==
            "notEqual" -> "!="
            "lessThan" -> "<"
            "lessOrEqual" -> "<="
            "greaterThan" -> ">"
            "greaterOrEqual" -> ">="
            else -> throw RuntimeException("Unknown operator: $comparator")
        }
    }

    private fun getDisjunctionCondition(condition: Pair<String, Double>): String {
        return when (condition.first) {
            ">=" -> "[${condition.second}"
            ">" -> "]${condition.second}"
            "<=" -> "${condition.second}]"
            "<" -> "${condition.second}["
            else -> throw RuntimeException("Operator ${condition.first} not supported as numerical operator")
        }
    }

}