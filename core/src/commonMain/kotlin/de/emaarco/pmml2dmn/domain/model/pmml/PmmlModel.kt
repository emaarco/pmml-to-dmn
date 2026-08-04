package de.emaarco.pmml2dmn.domain.model.pmml

import de.emaarco.pmml2dmn.domain.DmnMappingException

/**
 * A minimal, DOM-free representation of the subset of PMML that this converter supports:
 * a single decision-[TreeModel] with a data dictionary and a mining schema.
 */
data class PmmlModel(
    val dataFields: List<DataField>,
    val miningFields: List<MiningField>,
    val root: PmmlNode,
) {
    /** Name of the field flagged as `usageType="target"` in the mining schema, if any. */
    fun targetFieldName(): String? = miningFields.firstOrNull { it.usageType == "target" }?.name

    /** The single output/target data field. */
    fun targetField(): DataField {
        val name =
            targetFieldName()
                ?: throw DmnMappingException("Provided decision tree has no target attribute")
        return dataFields.firstOrNull { it.name == name }
            ?: throw DmnMappingException("Target field '$name' is not declared in the data dictionary")
    }

    /** All input fields, i.e. every data field that is not the target, in dictionary order. */
    fun nonTargetFields(): List<DataField> {
        val target = targetFieldName()
        return dataFields.filter { it.name != target }
    }

    /**
     * Every root-to-leaf path of the decision tree, excluding the synthetic root node.
     * Each path is the ordered list of nodes from the first real decision down to a leaf.
     */
    fun leafPaths(): List<List<PmmlNode>> {
        val paths = mutableListOf<List<PmmlNode>>()

        fun walk(node: PmmlNode, current: List<PmmlNode>) {
            val next = current + node
            if (node.children.isEmpty()) {
                paths.add(next)
            } else {
                node.children.forEach { walk(it, next) }
            }
        }
        root.children.forEach { walk(it, emptyList()) }
        return paths
    }
}
