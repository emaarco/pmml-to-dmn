package de.emaarco.pmmltodmn.api

import de.emaarco.pmmltodmn.domain.facade.DmnFacade
import de.emaarco.pmmltodmn.domain.model.dmn.DmnModelRequest
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import jakarta.servlet.http.HttpServletResponse

@RestController
@RequestMapping("/api")
internal class DmnController(private val dmnFacade: DmnFacade) {

    @PostMapping("/dmn")
    fun buildDmnModel(
        response: HttpServletResponse,
        @RequestPart("pmml-file") rawPmmlTree: MultipartFile,
        @RequestParam(name = "model-id") modelId: String,
        @RequestParam(name = "model-name") modelName: String,
        @RequestPart(name = "decision-id") decisionId: String,
        @RequestParam(name = "decision-name") decisionName: String,
    ): ResponseEntity<ByteArrayResource> {
        response.contentType = "application/xml"
        val request = DmnModelRequest(modelId, modelName, decisionId, decisionName)
        return ResponseEntity.ok().body(dmnFacade.buildDmnModel(rawPmmlTree, request))
    }

}