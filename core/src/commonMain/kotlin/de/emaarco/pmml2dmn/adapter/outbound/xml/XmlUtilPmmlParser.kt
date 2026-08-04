package de.emaarco.pmml2dmn.adapter.outbound.xml

import de.emaarco.pmml2dmn.application.port.outbound.PmmlParser
import de.emaarco.pmml2dmn.domain.PmmlParseException
import de.emaarco.pmml2dmn.domain.model.pmml.ComparisonOperator
import de.emaarco.pmml2dmn.domain.model.pmml.DataField
import de.emaarco.pmml2dmn.domain.model.pmml.MiningField
import de.emaarco.pmml2dmn.domain.model.pmml.PmmlModel
import de.emaarco.pmml2dmn.domain.model.pmml.PmmlNode
import de.emaarco.pmml2dmn.domain.model.pmml.Predicate
import de.emaarco.pmml2dmn.domain.model.pmml.SimplePredicate
import de.emaarco.pmml2dmn.domain.model.pmml.TruePredicate
import nl.adaptivity.xmlutil.EventType
import nl.adaptivity.xmlutil.XmlReader
import nl.adaptivity.xmlutil.xmlStreaming

/**
 * Multiplatform [PmmlParser] built on xmlutil's pull parser. Reads the supported PMML subset
 * (DataDictionary, MiningSchema, a single TreeModel with Nodes and SimplePredicates) into a
 * [PmmlModel]. Element namespaces are ignored; matching is done on local names only.
 */
class XmlUtilPmmlParser : PmmlParser {
    override fun parse(pmml: String): PmmlModel {
        val reader =
            try {
                xmlStreaming.newReader(pmml)
            } catch (ex: Exception) {
                throw PmmlParseException("Could not read PMML input: ${ex.message}")
            }

        val dataFields = mutableListOf<DataField>()
        val miningFields = mutableListOf<MiningField>()
        val nodeStack = ArrayDeque<MutableNode>()
        var root: MutableNode? = null

        try {
            while (reader.hasNext()) {
                when (reader.next()) {
                    EventType.START_ELEMENT ->
                        when (reader.localName) {
                            "DataField" ->
                                dataFields.add(
                                    DataField(reader.required("name"), reader.required("dataType"), reader.required("optype")),
                                )

                            "MiningField" ->
                                miningFields.add(
                                    MiningField(reader.required("name"), reader.attribute("usageType")),
                                )

                            "Node" -> {
                                val node = MutableNode(reader.attribute("id"), reader.attribute("score"))
                                nodeStack.lastOrNull()?.children?.add(node) ?: run { root = node }
                                nodeStack.addLast(node)
                            }

                            "SimplePredicate" ->
                                nodeStack.lastOrNull()?.let { parent ->
                                    if (parent.predicate == null) parent.predicate = readSimplePredicate(reader)
                                }

                            "True" ->
                                nodeStack.lastOrNull()?.let { parent ->
                                    if (parent.predicate == null) parent.predicate = TruePredicate
                                }
                        }

                    EventType.END_ELEMENT ->
                        if (reader.localName == "Node") {
                            nodeStack.removeLastOrNull()
                        }

                    else -> {} // ignore text, comments, whitespace, ...
                }
            }
        } catch (ex: PmmlParseException) {
            throw ex
        } catch (ex: Exception) {
            throw PmmlParseException("Could not parse PMML input: ${ex.message}")
        }

        val treeRoot = root ?: throw PmmlParseException("PMML document contains no decision tree (no <Node>)")
        return PmmlModel(dataFields, miningFields, treeRoot.toImmutable())
    }

    private fun readSimplePredicate(reader: XmlReader): Predicate {
        val field = reader.required("field")
        val operator = ComparisonOperator.fromPmml(reader.required("operator"))
        val value = reader.required("value")
        return SimplePredicate(field, operator, value)
    }

    private fun XmlReader.attribute(name: String): String? {
        for (i in 0 until attributeCount) {
            if (getAttributeLocalName(i) == name) return getAttributeValue(i)
        }
        return null
    }

    private fun XmlReader.required(name: String): String =
        attribute(name) ?: throw PmmlParseException("Missing required attribute '$name' on <$localName>")

    private class MutableNode(
        val id: String?,
        val score: String?,
        var predicate: Predicate? = null,
        val children: MutableList<MutableNode> = mutableListOf(),
    ) {
        fun toImmutable(): PmmlNode = PmmlNode(id, score, predicate, children.map { it.toImmutable() })
    }
}
