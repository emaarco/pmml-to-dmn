import { DmnModdle, type ModdleElement } from 'dmn-moddle';
import type { DmnModel } from '../model/dmn';

const CAMUNDA_NAMESPACE = 'http://camunda.org/schema/1.0/dmn';

/**
 * Serialize a [DmnModel] into a Camunda-compatible DMN 1.3 XML document using dmn-moddle.
 * Given the same model and ids, the output is deterministic.
 */
export async function serializeDmn(model: DmnModel): Promise<string> {
  const moddle = new DmnModdle();
  const create = (type: string, attributes: Record<string, unknown>): ModdleElement =>
    moddle.create(type, attributes);

  const table = model.decision.table;

  const inputs = table.inputs.map((input) =>
    create('dmn:InputClause', {
      id: input.id,
      label: input.label,
      inputExpression: create('dmn:LiteralExpression', {
        id: input.inputExpressionId,
        typeRef: input.typeRef,
        expressionLanguage: 'feel',
        text: input.expressionText,
      }),
    }),
  );

  const output = create('dmn:OutputClause', {
    id: table.output.id,
    name: table.output.name,
    typeRef: table.output.typeRef,
  });

  const rules = table.rules.map((rule) =>
    create('dmn:DecisionRule', {
      id: rule.id,
      inputEntry: rule.inputEntries.map((entry) =>
        create('dmn:UnaryTests', { id: entry.id, text: entry.feel }),
      ),
      outputEntry: [
        create('dmn:LiteralExpression', { id: rule.outputEntry.id, text: rule.outputEntry.text }),
      ],
    }),
  );

  const decisionTable = create('dmn:DecisionTable', {
    id: table.id,
    hitPolicy: 'FIRST',
    input: inputs,
    output: [output],
    rule: rules,
  });

  const decision = create('dmn:Decision', {
    id: model.decision.id,
    name: model.decision.name,
    decisionLogic: decisionTable,
  });

  const definitions = create('dmn:Definitions', {
    id: model.id,
    name: model.name,
    namespace: CAMUNDA_NAMESPACE,
    exporter: 'pmml-to-dmn',
    drgElement: [decision],
  });

  const { xml } = await moddle.toXML(definitions, { format: true });
  return xml;
}
