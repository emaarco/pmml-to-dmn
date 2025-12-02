package de.emaarco.pmmltodmn

import de.emaarco.pmmltodmn.domain.facade.DmnFacade
import de.emaarco.pmmltodmn.domain.model.dmn.DmnModelRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory

@SpringBootTest
class PmmlToDmnIntegrationTest {

    @Autowired
    private lateinit var dmnFacade: DmnFacade

    @Test
    fun `should convert credit-score PMML to expected DMN`() {
        // Load input PMML file
        val pmmlInputStream = javaClass.getResourceAsStream("/pmml/credit-score.xml")
            ?: throw RuntimeException("Could not load credit-score.xml from test resources")

        val pmmlBytes = pmmlInputStream.readBytes()
        val pmmlFile = MockMultipartFile("pmml-file", "credit-score.xml", "application/xml", pmmlBytes)

        // Create request
        val request = DmnModelRequest(
            dmnModelID = "credit-risk-v1",
            dmnModelName = "Credit Risk Model",
            dmnDecisionID = "assess-risk",
            dmnDecisionName = "Assess Credit Risk"
        )

        // Convert PMML to DMN
        val actualDmnResource = dmnFacade.buildDmnModel(pmmlFile, request)
        val actualDmnXml = actualDmnResource.inputStream.readBytes().toString(Charsets.UTF_8)

        // Parse result
        val doc = parseXml(actualDmnXml)
        val root = doc.documentElement

        // Assert model structure
        assertEquals("credit-risk-v1", root.getAttribute("id"))
        assertEquals("Credit Risk Model", root.getAttribute("name"))

        // Assert decision
        val decision = root.getElementsByTagName("decision").item(0) as org.w3c.dom.Element
        assertEquals("assess-risk", decision.getAttribute("id"))
        assertEquals("Assess Credit Risk", decision.getAttribute("name"))

        // Assert input (score)
        val inputs = root.getElementsByTagName("input")
        assertEquals(1, inputs.length)
        val input = inputs.item(0) as org.w3c.dom.Element
        assertEquals("score", input.getAttribute("label"))
        val inputText = input.getElementsByTagName("text").item(0)
        assertEquals("score", inputText.textContent.trim())

        // Assert output (result)
        val outputs = root.getElementsByTagName("output")
        assertEquals(1, outputs.length)
        val output = outputs.item(0) as org.w3c.dom.Element
        assertEquals("result", output.getAttribute("name"))
        assertEquals("string", output.getAttribute("typeRef"))

        // Assert rules
        val rules = root.getElementsByTagName("rule")
        assertEquals(2, rules.length)

        val ruleSet = mutableSetOf<Pair<String, String>>()
        for (i in 0 until rules.length) {
            val rule = rules.item(i) as org.w3c.dom.Element
            val inputEntry = rule.getElementsByTagName("inputEntry").item(0).textContent.trim()
            val outputEntry = rule.getElementsByTagName("outputEntry").item(0).textContent.trim()
            ruleSet.add(Pair(inputEntry, outputEntry))
        }

        // Expected rules
        assert(ruleSet.contains(Pair(">= 50.0", "\"PASS\"")))
        assert(ruleSet.contains(Pair("< 50.0", "\"FAIL\"")))
    }

    private fun parseXml(xml: String): Document {
        val factory = DocumentBuilderFactory.newInstance()
        val builder = factory.newDocumentBuilder()
        return builder.parse(InputSource(StringReader(xml)))
    }
}
