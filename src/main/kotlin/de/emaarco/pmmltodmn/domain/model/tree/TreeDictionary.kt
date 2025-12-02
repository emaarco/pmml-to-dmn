package de.emaarco.pmmltodmn.domain.model.tree

import de.emaarco.pmmltodmn.domain.utils.NodeUtils
import org.w3c.dom.Document

/**
 * All data-fields that are used in the decision tree
 * (--> either as an input- or as an output-field)
 */
class TreeDictionary(document: Document) {

    var dictionary: MutableList<DataField> = ArrayList()

    init {
        this.fillDictionary(document)
    }

    fun getNonTargetFields(): List<DataField> {
        return dictionary.filter { field -> !field.isTarget }
    }

    fun getTargetAttribute(): DataField {
        return dictionary.find { field -> field.isTarget }
            ?: throw RuntimeException("Provided decision-tree has no target-attribute")
    }

    /* -------------------------- private helper methods -------------------------- */

    private fun fillDictionary(document: Document) {
        val dataFields = document.getElementsByTagName("DataField")
        val miningFields = getMiningFields(document)
        for (i in 0 until dataFields.length) {
            val field = dataFields.item(i)
            val fieldName = NodeUtils.getValueOfNodeAttribute(field, "name")
            val dataType = NodeUtils.getValueOfNodeAttribute(field, "dataType")
            val opType = NodeUtils.getValueOfNodeAttribute(field, "optype")
            val miningField = getMiningField(miningFields, fieldName)
            val isTarget = miningField?.usageType == "target"
            dictionary.add(DataField(fieldName, dataType, opType, isTarget))
        }
    }

    private fun getMiningFields(document: Document): List<MiningField> {
        val rawFields = document.getElementsByTagName("MiningField")
        return NodeUtils.mapToList(rawFields).map { field ->
            val name = NodeUtils.getValueOfNodeAttribute(field, "name")
            val usageType = field.attributes.getNamedItem("usageType")?.nodeValue
            MiningField(name, usageType)
        }
    }

    private fun getMiningField(miningFields: List<MiningField>, requiredField: String): MiningField? {
        return miningFields.find { currentField -> currentField.name == requiredField }
    }

}