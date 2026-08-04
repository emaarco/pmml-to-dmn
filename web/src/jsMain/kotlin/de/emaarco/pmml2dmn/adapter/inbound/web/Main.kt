package de.emaarco.pmml2dmn.adapter.inbound.web

import de.emaarco.pmml2dmn.Pmml2Dmn
import de.emaarco.pmml2dmn.application.port.inbound.ConvertPmmlToDmnUseCase
import de.emaarco.pmml2dmn.domain.PmmlToDmnException
import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.html.button
import kotlinx.html.classes
import kotlinx.html.div
import kotlinx.html.dom.append
import kotlinx.html.h1
import kotlinx.html.h2
import kotlinx.html.header
import kotlinx.html.id
import kotlinx.html.js.onClickFunction
import kotlinx.html.p
import kotlinx.html.pre
import kotlinx.html.textArea
import org.w3c.dom.HTMLAnchorElement
import org.w3c.dom.HTMLTextAreaElement
import org.w3c.dom.url.URL
import org.w3c.files.Blob
import org.w3c.files.BlobPropertyBag

private var lastDmn: String = ""

fun main() {
    val app = document.getElementById("app") ?: return
    app.append {
        div("wrap") {
            header {
                h1 { +"PMML → DMN Converter" }
                p { +"Convert a PMML decision-tree model into a DMN decision table — entirely in your browser." }
            }
            div("grid") {
                div("panel") {
                    h2 { +"PMML input" }
                    textArea {
                        id = "pmml-input"
                        +SAMPLE_PMML
                    }
                    div("toolbar") {
                        button {
                            +"Convert"
                            onClickFunction = { convert() }
                        }
                        button {
                            classes = setOf("secondary")
                            +"Load example"
                            onClickFunction = { loadExample() }
                        }
                    }
                    p {
                        classes = setOf("error")
                        id = "error"
                    }
                }
                div("panel") {
                    h2 { +"Generated DMN" }
                    pre { id = "dmn-output" }
                    div("toolbar") {
                        button {
                            classes = setOf("secondary")
                            +"Download .dmn"
                            onClickFunction = { download() }
                        }
                        button {
                            classes = setOf("secondary")
                            +"Copy"
                            onClickFunction = { copy() }
                        }
                    }
                }
            }
            div("panel") {
                h2 { +"DMN preview" }
                p {
                    classes = setOf("hint")
                    +"Rendered with dmn-js when available."
                }
                div { id = "dmn-canvas" }
            }
        }
    }
    convert()
}

private fun convert() {
    val input = (document.getElementById("pmml-input") as HTMLTextAreaElement).value
    val errorEl = document.getElementById("error")
    val outputEl = document.getElementById("dmn-output")
    try {
        val dmn =
            Pmml2Dmn.converter().convert(
                ConvertPmmlToDmnUseCase.Command(
                    pmml = input,
                    modelId = "pmml-to-dmn",
                    modelName = "PMML to DMN",
                    decisionId = "decision",
                    decisionName = "Decision",
                ),
            )
        lastDmn = dmn
        outputEl?.textContent = dmn
        errorEl?.textContent = ""
        renderDmn(dmn)
    } catch (ex: PmmlToDmnException) {
        errorEl?.textContent = ex.message ?: "Conversion failed"
    } catch (ex: Throwable) {
        errorEl?.textContent = "Unexpected error: ${ex.message}"
    }
}

private fun loadExample() {
    (document.getElementById("pmml-input") as HTMLTextAreaElement).value = SAMPLE_PMML
    convert()
}

private fun download() {
    if (lastDmn.isEmpty()) return
    val blob = Blob(arrayOf(lastDmn), BlobPropertyBag(type = "application/xml"))
    val url = URL.createObjectURL(blob)
    val anchor = document.createElement("a") as HTMLAnchorElement
    anchor.href = url
    anchor.download = "model.dmn"
    anchor.click()
    URL.revokeObjectURL(url)
}

private fun copy() {
    if (lastDmn.isEmpty()) return
    val clipboard = window.navigator.asDynamic().clipboard
    if (clipboard != null) clipboard.writeText(lastDmn)
}

private fun renderDmn(xml: String) {
    val canvas = document.getElementById("dmn-canvas") ?: return
    val hasViewer = js("typeof window.DmnJS !== 'undefined'") as Boolean
    if (!hasViewer) {
        canvas.textContent = "dmn-js viewer is not loaded — the generated DMN is shown on the left."
        return
    }
    canvas.innerHTML = ""
    val viewer = js("new window.DmnJS({ container: document.getElementById('dmn-canvas') })")
    viewer.asDynamic().importXML(xml)
}
