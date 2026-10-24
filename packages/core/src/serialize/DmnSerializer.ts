import { DmnModdle, type ModdleElement } from 'dmn-moddle';
import type { DecisionTable, DmnModel, DmnRule, InputColumn } from '../model/dmn';

const CAMUNDA_NAMESPACE = 'http://camunda.org/schema/1.0/dmn';

export class DmnSerializer {
  private readonly moddle = new DmnModdle();

  async serialize(model: DmnModel): Promise<string> {
    const decision = this.moddle.create('dmn:Decision', {
      id: model.decision.id,
      name: model.decision.name,
      decisionLogic: this.decisionTable(model.decision.table),
    });
    const definitions = this.moddle.create('dmn:Definitions', {
      id: model.id,
      name: model.name,
      namespace: CAMUNDA_NAMESPACE,
      exporter: 'pmml-to-dmn',
      drgElement: [decision],
    });
    const { xml } = await this.moddle.toXML(definitions, { format: true });
    return xml;
  }

  private decisionTable(table: DecisionTable): ModdleElement {
    return this.moddle.create('dmn:DecisionTable', {
      id: table.id,
      hitPolicy: table.hitPolicy,
      input: table.inputs.map((input) => this.inputClause(input)),
      output: [
        this.moddle.create('dmn:OutputClause', {
          id: table.output.id,
          name: table.output.name,
          typeRef: table.output.typeRef,
        }),
      ],
      rule: table.rules.map((rule) => this.decisionRule(rule)),
    });
  }

  private inputClause(input: InputColumn): ModdleElement {
    return this.moddle.create('dmn:InputClause', {
      id: input.id,
      label: input.label,
      inputExpression: this.moddle.create('dmn:LiteralExpression', {
        id: input.inputExpressionId,
        typeRef: input.typeRef,
        expressionLanguage: 'feel',
        text: input.expressionText,
      }),
    });
  }

  private decisionRule(rule: DmnRule): ModdleElement {
    return this.moddle.create('dmn:DecisionRule', {
      id: rule.id,
      inputEntry: rule.inputEntries.map((entry) =>
        this.moddle.create('dmn:UnaryTests', { id: entry.id, text: entry.feel }),
      ),
      outputEntry: [
        this.moddle.create('dmn:LiteralExpression', {
          id: rule.outputEntry.id,
          text: rule.outputEntry.text,
        }),
      ],
    });
  }
}
