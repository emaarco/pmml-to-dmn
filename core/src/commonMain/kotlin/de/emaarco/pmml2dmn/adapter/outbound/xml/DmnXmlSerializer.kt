package de.emaarco.pmml2dmn.adapter.outbound.xml

import de.emaarco.pmml2dmn.application.port.outbound.DmnSerializer
import de.emaarco.pmml2dmn.domain.model.dmn.DmnDefinitions

/**
 * Multiplatform [DmnSerializer] that renders [DmnDefinitions] into a Camunda-compatible DMN
 * XML document. The output is deterministic (indentation and attribute order are fixed) so it
 * can be compared against golden files. All text and attribute values are XML-escaped.
 */
class DmnXmlSerializer : DmnSerializer {
    override fun serialize(definitions: DmnDefinitions): String {
        val sb = StringBuilder()
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        sb
            .append("<definitions ")
            .append("xmlns=\"https://www.omg.org/spec/DMN/20191111/MODEL/\" ")
            .append("xmlns:dmndi=\"https://www.omg.org/spec/DMN/20191111/DMNDI/\" ")
            .append("xmlns:dc=\"http://www.omg.org/spec/DMN/20180521/DC/\" ")
            .append("namespace=\"http://camunda.org/schema/1.0/dmn\" ")
            .append("id=\"${attr(definitions.id)}\" ")
            .append("name=\"${attr(definitions.name)}\" ")
            .append("exporter=\"pmml-to-dmn\">\n")

        val decision = definitions.decision
        sb.append("  <decision id=\"${attr(decision.id)}\" name=\"${attr(decision.name)}\">\n")

        val table = decision.table
        sb.append("    <decisionTable id=\"${attr(table.id)}\">\n")

        for (input in table.inputs) {
            sb.append("      <input id=\"${attr(input.id)}\" label=\"${attr(input.label)}\">\n")
            sb
                .append("        <inputExpression ")
                .append("id=\"${attr(input.inputExpressionId)}\" ")
                .append("typeRef=\"${attr(input.typeRef)}\" ")
                .append("expressionLanguage=\"feel\">\n")
            sb.append("          <text>${text(input.expressionText)}</text>\n")
            sb.append("        </inputExpression>\n")
            sb.append("      </input>\n")
        }

        val output = table.output
        sb.append("      <output id=\"${attr(output.id)}\" name=\"${attr(output.name)}\" typeRef=\"${attr(output.typeRef)}\" />\n")

        for (rule in table.rules) {
            sb.append("      <rule id=\"${attr(rule.id)}\">\n")
            for (entry in rule.inputEntries) {
                sb.append("        <inputEntry id=\"${attr(entry.id)}\">\n")
                sb.append("          <text>${text(entry.feel)}</text>\n")
                sb.append("        </inputEntry>\n")
            }
            sb.append("        <outputEntry id=\"${attr(rule.outputEntry.id)}\">\n")
            sb.append("          <text>${text(rule.outputEntry.text)}</text>\n")
            sb.append("        </outputEntry>\n")
            sb.append("      </rule>\n")
        }

        sb.append("    </decisionTable>\n")
        sb.append("  </decision>\n")
        sb.append("</definitions>\n")
        return sb.toString()
    }

    private fun text(value: String): String =
        value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")

    private fun attr(value: String): String =
        value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
}
