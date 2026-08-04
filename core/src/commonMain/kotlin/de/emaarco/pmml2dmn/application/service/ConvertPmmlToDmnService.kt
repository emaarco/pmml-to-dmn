package de.emaarco.pmml2dmn.application.service

import de.emaarco.pmml2dmn.application.port.inbound.ConvertPmmlToDmnUseCase
import de.emaarco.pmml2dmn.application.port.outbound.DmnSerializer
import de.emaarco.pmml2dmn.application.port.outbound.IdGenerator
import de.emaarco.pmml2dmn.application.port.outbound.PmmlParser
import de.emaarco.pmml2dmn.domain.DmnMappingException
import de.emaarco.pmml2dmn.domain.model.dmn.Decision
import de.emaarco.pmml2dmn.domain.model.dmn.DecisionTable
import de.emaarco.pmml2dmn.domain.model.dmn.DmnDefinitions
import de.emaarco.pmml2dmn.domain.model.dmn.DmnRule
import de.emaarco.pmml2dmn.domain.model.dmn.InputColumn
import de.emaarco.pmml2dmn.domain.model.dmn.InputEntry
import de.emaarco.pmml2dmn.domain.model.dmn.OutputColumn
import de.emaarco.pmml2dmn.domain.model.dmn.OutputEntry
import de.emaarco.pmml2dmn.domain.model.dmn.condition.CategoricalCondition
import de.emaarco.pmml2dmn.domain.model.dmn.condition.DecisionRuleCondition
import de.emaarco.pmml2dmn.domain.model.dmn.condition.EmptyCondition
import de.emaarco.pmml2dmn.domain.model.dmn.condition.NumericalCondition
import de.emaarco.pmml2dmn.domain.model.pmml.DataField
import de.emaarco.pmml2dmn.domain.model.pmml.PmmlModel
import de.emaarco.pmml2dmn.domain.model.pmml.PmmlNode
import de.emaarco.pmml2dmn.domain.model.pmml.SimplePredicate

/**
 * Converts a PMML decision tree into a DMN model: parse the PMML, map the tree onto a
 * DMN decision table and serialize the result. Parsing and serialization are delegated to
 * outbound ports so the mapping logic stays free of any XML/platform concern.
 */
class ConvertPmmlToDmnService(
    private val parser: PmmlParser,
    private val serializer: DmnSerializer,
    private val idGenerator: IdGenerator,
) : ConvertPmmlToDmnUseCase {
    override fun convert(command: ConvertPmmlToDmnUseCase.Command): String {
        val model = parser.parse(command.pmml)
        val definitions = mapToDmn(model, command)
        return serializer.serialize(definitions)
    }

    // -------------------------- private mapping methods --------------------------

    private fun mapToDmn(model: PmmlModel, command: ConvertPmmlToDmnUseCase.Command): DmnDefinitions {
        val inputFields = model.nonTargetFields()
        val targetField = model.targetField()

        val tableId = idGenerator.generate("DecisionTable")
        val inputs =
            inputFields.map { field ->
                InputColumn(
                    id = idGenerator.generate("Input"),
                    inputExpressionId = idGenerator.generate("InputExpression"),
                    label = field.name,
                    typeRef = field.dataType,
                    expressionText = toVariableName(field.name),
                )
            }
        val output =
            OutputColumn(
                id = idGenerator.generate("Output"),
                name = targetField.name,
                typeRef = targetField.dataType,
            )
        val rules = model.leafPaths().map { path -> buildRule(path, inputFields) }

        val table = DecisionTable(tableId, inputs, output, rules)
        val decision = Decision(command.decisionId, command.decisionName, table)
        return DmnDefinitions(command.modelId, command.modelName, decision)
    }

    private fun buildRule(path: List<PmmlNode>, inputFields: List<DataField>): DmnRule {
        val predicatesByField =
            path
                .mapNotNull { it.predicate as? SimplePredicate }
                .groupBy { it.field }

        val inputEntries =
            inputFields.map { field ->
                val predicates = predicatesByField[field.name].orEmpty()
                val condition = buildCondition(field.opType, predicates)
                InputEntry(idGenerator.generate("UnaryTests"), condition.getFeelCondition())
            }

        val score =
            path.last().score
                ?: throw DmnMappingException("Leaf node '${path.last().id}' has no score")
        val outputEntry = OutputEntry(idGenerator.generate("LiteralExpression"), "\"$score\"")

        return DmnRule(idGenerator.generate("DecisionRule"), inputEntries, outputEntry)
    }

    private fun buildCondition(opType: String, predicates: List<SimplePredicate>): DecisionRuleCondition =
        when {
            predicates.isEmpty() -> EmptyCondition()
            opType == "continuous" -> NumericalCondition(predicates)
            else -> CategoricalCondition(predicates.first().value)
        }

    private fun toVariableName(attributeName: String): String =
        attributeName.lowercase().replace(" ", "_")
}
