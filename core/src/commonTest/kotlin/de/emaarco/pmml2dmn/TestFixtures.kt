package de.emaarco.pmml2dmn

import de.emaarco.pmml2dmn.application.port.inbound.ConvertPmmlToDmnUseCase

/** A minimal single-input decision tree: numeric `score` -> categorical `result`. */
val CREDIT_SCORE_PMML: String =
    """
    <?xml version="1.0" encoding="UTF-8"?>
    <PMML xmlns="http://www.dmg.org/PMML-4_4" version="4.4">
        <Header description="Minimal Decision Tree"/>
        <DataDictionary numberOfFields="2">
            <DataField name="score" optype="continuous" dataType="integer"/>
            <DataField name="result" optype="categorical" dataType="string"/>
        </DataDictionary>
        <TreeModel modelName="SimpleModel" functionName="classification">
            <MiningSchema>
                <MiningField name="score" usageType="active"/>
                <MiningField name="result" usageType="target"/>
            </MiningSchema>
            <Node id="1" score="FAIL">
                <True/>
                <Node id="2" score="PASS">
                    <SimplePredicate field="score" operator="greaterOrEqual" value="50"/>
                </Node>
                <Node id="3" score="FAIL">
                    <SimplePredicate field="score" operator="lessThan" value="50"/>
                </Node>
            </Node>
        </TreeModel>
    </PMML>
    """.trimIndent()

fun creditScoreCommand(): ConvertPmmlToDmnUseCase.Command =
    ConvertPmmlToDmnUseCase.Command(
        pmml = CREDIT_SCORE_PMML,
        modelId = "credit-risk-v1",
        modelName = "Credit Risk Model",
        decisionId = "assess-risk",
        decisionName = "Assess Credit Risk",
    )
