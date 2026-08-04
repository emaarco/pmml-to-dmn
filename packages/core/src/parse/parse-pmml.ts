import { XMLParser } from 'fast-xml-parser';
import { PmmlParseError, UnsupportedPmmlFeatureError } from '../model/errors';
import {
  type DataField,
  isComparisonOperator,
  type MiningField,
  type PmmlModel,
  type PmmlNode,
  type Predicate,
} from '../model/pmml';

type XmlNode = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  parseTagValue: false,
  parseAttributeValue: false,
});

/** Parse the supported PMML subset (single TreeModel) into a [PmmlModel]. */
export function parsePmml(pmml: string): PmmlModel {
  let doc: unknown;
  try {
    doc = parser.parse(pmml);
  } catch (error) {
    throw new PmmlParseError(`Could not parse PMML input: ${message(error)}`);
  }

  const root = asRecord(doc);
  const pmmlEl = root && asRecord(root.PMML);
  if (!pmmlEl) throw new PmmlParseError('Not a PMML document (missing <PMML> root)');

  const dictionary = firstChild(pmmlEl, 'DataDictionary');
  const dataFields = dictionary ? children(dictionary, 'DataField').map(readDataField) : [];

  const treeModel = firstChild(pmmlEl, 'TreeModel');
  if (!treeModel) throw new PmmlParseError('PMML document contains no <TreeModel>');

  const schema = firstChild(treeModel, 'MiningSchema');
  const miningFields = schema ? children(schema, 'MiningField').map(readMiningField) : [];

  const rootNode = firstChild(treeModel, 'Node');
  if (!rootNode) throw new PmmlParseError('TreeModel contains no <Node>');

  return { dataFields, miningFields, root: readNode(rootNode) };
}

function readDataField(el: XmlNode): DataField {
  return {
    name: required(el, 'name'),
    dataType: required(el, 'dataType'),
    opType: required(el, 'optype'),
  };
}

function readMiningField(el: XmlNode): MiningField {
  return { name: required(el, 'name'), usageType: attr(el, 'usageType') };
}

function readNode(el: XmlNode): PmmlNode {
  return {
    id: attr(el, 'id'),
    score: attr(el, 'score'),
    predicate: readPredicate(el),
    children: children(el, 'Node').map(readNode),
  };
}

function readPredicate(node: XmlNode): Predicate | undefined {
  const simple = firstChild(node, 'SimplePredicate');
  if (simple) {
    const operator = required(simple, 'operator');
    if (!isComparisonOperator(operator)) {
      throw new UnsupportedPmmlFeatureError(`Unknown SimplePredicate operator: ${operator}`);
    }
    return {
      kind: 'simple',
      field: required(simple, 'field'),
      operator,
      value: required(simple, 'value'),
    };
  }
  if (node.True !== undefined) return { kind: 'true' };
  return undefined;
}

function asRecord(value: unknown): XmlNode | undefined {
  return typeof value === 'object' && value !== null ? (value as XmlNode) : undefined;
}

function children(node: XmlNode, name: string): XmlNode[] {
  const value = node[name];
  if (value === undefined) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map(asRecord).filter((x): x is XmlNode => x !== undefined);
}

function firstChild(node: XmlNode, name: string): XmlNode | undefined {
  return children(node, name).at(0);
}

function attr(node: XmlNode, name: string): string | undefined {
  const value = node[`@_${name}`];
  return value === undefined || value === null ? undefined : String(value);
}

function required(node: XmlNode, name: string): string {
  const value = attr(node, name);
  if (value === undefined) throw new PmmlParseError(`Missing required attribute '${name}'`);
  return value;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
