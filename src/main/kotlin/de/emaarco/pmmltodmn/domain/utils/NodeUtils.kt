package de.emaarco.pmmltodmn.domain.utils

import org.w3c.dom.Node
import org.w3c.dom.NodeList

object NodeUtils {

    fun mapToList(nodeList: NodeList): List<Node> {
        val resultList: MutableList<Node> = ArrayList()
        for (i in 0 until nodeList.length) {
            resultList.add(nodeList.item(i))
        }
        return resultList
    }

    fun getValueOfNodeAttribute(node: Node, attribute: String?): String {
        return node.attributes
            .getNamedItem(attribute)
            .nodeValue
    }

    fun getConditionOfTreeNode(node: Node): Node {
        var conditionNode: Node? = null
        val childNodes = node.childNodes
        for (i in 0 until childNodes.length) {
            val childNode = childNodes.item(i)
            val isConditionNode = childNode.nodeName == "SimplePredicate"
            if (isConditionNode) {
                conditionNode = childNode
                break
            }
        }
        if (conditionNode == null) {
            throw RuntimeException("SimplePredicate condition node not found!")
        }
        return conditionNode
    }
}