import type { IdGenerator } from '../id';
import type { DmnModel, DmnRule, InputColumn } from '../model/dmn';
import { DmnMappingError } from '../model/errors';
import type { DataField, PmmlModel, PmmlNode, SimplePredicate } from '../model/pmml';
import { categoricalCondition, emptyCondition, numericalCondition } from './conditions';

/** Metadata for the generated DMN model, supplied by the caller. */
export interface DmnMetadata {
  readonly modelId: string;
  readonly modelName: string;
  readonly decisionId: string;
  readonly decisionName: string;
}

/** Pure transform: PMML decision tree -> DMN model. Ids come from the injected [nextId]. */
export function mapToDmn(model: PmmlModel, meta: DmnMetadata, nextId: IdGenerator): DmnModel {
  const inputFields = nonTargetFields(model);
  const target = targetField(model);

  const tableId = nextId('DecisionTable');
  const inputs: InputColumn[] = inputFields.map((field) => ({
    id: nextId('Input'),
    inputExpressionId: nextId('InputExpression'),
    label: field.name,
    typeRef: field.dataType,
    expressionText: toVariableName(field.name),
  }));
  const output = {
    id: nextId('Output'),
    name: target.name,
    typeRef: target.dataType,
  };
  const rules = leafPaths(model).map((path) => buildRule(path, inputFields, nextId));

  return {
    id: meta.modelId,
    name: meta.modelName,
    decision: {
      id: meta.decisionId,
      name: meta.decisionName,
      table: { id: tableId, inputs, output, rules },
    },
  };
}

/** Every root-to-leaf path of the decision tree, excluding the synthetic root node. */
export function leafPaths(model: PmmlModel): PmmlNode[][] {
  const paths: PmmlNode[][] = [];
  const walk = (node: PmmlNode, current: PmmlNode[]): void => {
    const next = [...current, node];
    if (node.children.length === 0) {
      paths.push(next);
    } else {
      for (const child of node.children) walk(child, next);
    }
  };
  for (const child of model.root.children) walk(child, []);
  return paths;
}

function buildRule(
  path: readonly PmmlNode[],
  inputFields: readonly DataField[],
  nextId: IdGenerator,
): DmnRule {
  const predicatesByField = groupPredicatesByField(path);

  const inputEntries = inputFields.map((field) => ({
    id: nextId('UnaryTests'),
    feel: buildFeel(field.opType, predicatesByField.get(field.name) ?? []),
  }));

  const leaf = path.at(-1);
  if (!leaf || leaf.score === undefined) {
    throw new DmnMappingError(`Leaf node '${leaf?.id ?? '?'}' has no score`);
  }
  const outputEntry = { id: nextId('LiteralExpression'), text: `"${leaf.score}"` };

  return { id: nextId('DecisionRule'), inputEntries, outputEntry };
}

function buildFeel(opType: string, predicates: readonly SimplePredicate[]): string {
  if (predicates.length === 0) return emptyCondition();
  if (opType === 'continuous') return numericalCondition(predicates);
  const first = predicates.at(0);
  return first ? categoricalCondition(first.value) : emptyCondition();
}

function groupPredicatesByField(path: readonly PmmlNode[]): Map<string, SimplePredicate[]> {
  const grouped = new Map<string, SimplePredicate[]>();
  for (const node of path) {
    if (node.predicate?.kind === 'simple') {
      const list = grouped.get(node.predicate.field) ?? [];
      list.push(node.predicate);
      grouped.set(node.predicate.field, list);
    }
  }
  return grouped;
}

function targetFieldName(model: PmmlModel): string | undefined {
  return model.miningFields.find((f) => f.usageType === 'target')?.name;
}

function targetField(model: PmmlModel): DataField {
  const name = targetFieldName(model);
  if (name === undefined) {
    throw new DmnMappingError('Provided decision tree has no target attribute');
  }
  const field = model.dataFields.find((f) => f.name === name);
  if (!field) {
    throw new DmnMappingError(`Target field '${name}' is not declared in the data dictionary`);
  }
  return field;
}

function nonTargetFields(model: PmmlModel): DataField[] {
  const target = targetFieldName(model);
  return model.dataFields.filter((f) => f.name !== target);
}

function toVariableName(name: string): string {
  return name.toLowerCase().replaceAll(' ', '_');
}
