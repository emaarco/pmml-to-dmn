import type { IdGenerator } from '../ids/IdGenerator';
import type { DmnMetadata, DmnModel, DmnRule, InputColumn, OutputColumn } from '../model/dmn';
import { DmnMappingError } from '../model/errors';
import type { DataField, PmmlModel, PmmlNode, SimplePredicate } from '../model/pmml';
import { FeelConditionBuilder } from './FeelConditionBuilder';

export class DmnMapper {
  private readonly conditions = new FeelConditionBuilder();

  map(pmml: PmmlModel, metadata: DmnMetadata, ids: IdGenerator): DmnModel {
    const target = this.targetField(pmml);
    const inputFields = pmml.dataFields.filter((field) => field.name !== target.name);

    const tableId = ids.next('DecisionTable');
    const inputs = inputFields.map((field) => this.inputColumn(field, ids));
    const output: OutputColumn = {
      id: ids.next('Output'),
      name: target.name,
      typeRef: target.dataType,
    };
    const rules = this.leafPaths(pmml.root).map((path) => this.rule(path, inputFields, ids));

    return {
      id: metadata.modelId,
      name: metadata.modelName,
      decision: {
        id: metadata.decisionId,
        name: metadata.decisionName,
        table: { id: tableId, hitPolicy: metadata.hitPolicy ?? 'FIRST', inputs, output, rules },
      },
    };
  }

  private targetField(pmml: PmmlModel): DataField {
    const name = pmml.miningFields.find((field) => field.usageType === 'target')?.name;
    if (name === undefined) {
      throw new DmnMappingError('Provided decision tree has no target attribute');
    }
    const field = pmml.dataFields.find((candidate) => candidate.name === name);
    if (!field) {
      throw new DmnMappingError(`Target field '${name}' is not declared in the data dictionary`);
    }
    return field;
  }

  private inputColumn(field: DataField, ids: IdGenerator): InputColumn {
    return {
      id: ids.next('Input'),
      inputExpressionId: ids.next('InputExpression'),
      label: field.name,
      typeRef: field.dataType,
      expressionText: field.name.toLowerCase().replaceAll(' ', '_'),
    };
  }

  private leafPaths(root: PmmlNode): PmmlNode[][] {
    return root.children.flatMap((child) => this.pathsBelow(child, []));
  }

  private pathsBelow(node: PmmlNode, ancestors: readonly PmmlNode[]): PmmlNode[][] {
    const path = [...ancestors, node];
    if (node.children.length === 0) return [path];
    return node.children.flatMap((child) => this.pathsBelow(child, path));
  }

  private rule(
    path: readonly PmmlNode[],
    inputFields: readonly DataField[],
    ids: IdGenerator,
  ): DmnRule {
    const predicatesByField = this.predicatesByField(path);
    const inputEntries = inputFields.map((field) => ({
      id: ids.next('UnaryTests'),
      feel: this.conditions.build(field.opType, predicatesByField.get(field.name) ?? []),
    }));

    const leaf = path.at(-1);
    if (leaf?.score === undefined) {
      throw new DmnMappingError(`Leaf node '${leaf?.id ?? '?'}' has no score`);
    }
    const outputEntry = { id: ids.next('LiteralExpression'), text: `"${leaf.score}"` };

    return { id: ids.next('DecisionRule'), inputEntries, outputEntry };
  }

  private predicatesByField(path: readonly PmmlNode[]): Map<string, SimplePredicate[]> {
    const grouped = new Map<string, SimplePredicate[]>();
    for (const { predicate } of path) {
      if (predicate?.kind === 'simple') {
        grouped.set(predicate.field, [...(grouped.get(predicate.field) ?? []), predicate]);
      }
    }
    return grouped;
  }
}
