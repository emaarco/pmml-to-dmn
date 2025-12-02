package de.emaarco.pmmltodmn.domain.model.tree

import org.w3c.dom.Document
import org.w3c.dom.Node
import org.w3c.dom.NodeList
import java.util.*
import java.util.function.Consumer

/**
 * All paths of the decision tree from root to leaf
 */
class TreePaths(document: Document) {

    val treePaths: TreeMap<Int, List<Node>> = TreeMap();

    init {
        this.buildDecisionTree(document)
    }

    /* -------------------------- private helper methods -------------------------- */

    private fun buildDecisionTree(document: Document) {
        val allNodes = getAllNodes(document)
        if (allNodes.length > 0) {
            val rootNode = allNodes.item(0)
            val childNodes = getChildNodes(rootNode)
            childNodes.forEach(Consumer { child: Node -> findAllChildrenRecursive(child, ArrayList()) })
        }
    }

    private fun findAllChildrenRecursive(node: Node, currentRow: MutableList<Node>) {
        currentRow.add(node)
        val children = getChildNodes(node)
        if (children.isEmpty()) {
            treePaths[treePaths.size + 1] = currentRow
        } else {
            children.forEach(Consumer { child: Node -> findAllChildrenRecursive(child, ArrayList(currentRow)) })
        }
    }

    private fun getChildNodes(node: Node): List<Node> {
        val treeChildNodes = ArrayList<Node>()
        val childNodes = node.childNodes
        for (i in 0 until childNodes.length) {
            val childNode = childNodes.item(i)
            val isChild = childNode.nodeName == "Node"
            if (isChild) {
                treeChildNodes.add(childNode)
            }
        }
        return treeChildNodes
    }

    private fun getAllNodes(document: Document): NodeList {
        return document.getElementsByTagName("Node")
    }

}