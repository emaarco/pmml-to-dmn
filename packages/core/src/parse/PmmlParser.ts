import { XMLParser } from 'fast-xml-parser';
import { PmmlParseError, UnsupportedPmmlFeatureError } from '../model/errors';
import {
  COMPARISON_OPERATORS,
  type ComparisonOperator,
  type DataField,
  type MiningField,
  type PmmlModel,
  type PmmlNode,
  type Predicate,
} from '../model/pmml';

type XmlNode = Record<string, unknown>;

export class PmmlParser {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    parseAttributeValue: false,
  });

  parse(pmml: string): PmmlModel {
    const pmmlElement = this.asRecord(this.asRecord(this.parseXml(pmml))?.PMML);
    if (!pmmlElement) throw new PmmlParseError('Not a PMML document (missing <PMML> root)');

    const dictionary = this.firstChild(pmmlElement, 'DataDictionary');
    const dataFields = dictionary
      ? this.children(dictionary, 'DataField').map((element) => this.readDataField(element))
      : [];

    const treeModel = this.firstChild(pmmlElement, 'TreeModel');
    if (!treeModel) throw new PmmlParseError('PMML document contains no <TreeModel>');

    const schema = this.firstChild(treeModel, 'MiningSchema');
    const miningFields = schema
      ? this.children(schema, 'MiningField').map((element) => this.readMiningField(element))
      : [];

    const rootNode = this.firstChild(treeModel, 'Node');
    if (!rootNode) throw new PmmlParseError('TreeModel contains no <Node>');

    return { dataFields, miningFields, root: this.readNode(rootNode) };
  }

  private parseXml(pmml: string): unknown {
    try {
      return this.xmlParser.parse(pmml);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new PmmlParseError(`Could not parse PMML input: ${reason}`);
    }
  }

  private readDataField(element: XmlNode): DataField {
    return {
      name: this.requiredAttribute(element, 'name'),
      dataType: this.requiredAttribute(element, 'dataType'),
      opType: this.requiredAttribute(element, 'optype'),
    };
  }

  private readMiningField(element: XmlNode): MiningField {
    return {
      name: this.requiredAttribute(element, 'name'),
      usageType: this.attribute(element, 'usageType'),
    };
  }

  private readNode(element: XmlNode): PmmlNode {
    return {
      id: this.attribute(element, 'id'),
      score: this.attribute(element, 'score'),
      predicate: this.readPredicate(element),
      children: this.children(element, 'Node').map((child) => this.readNode(child)),
    };
  }

  private readPredicate(node: XmlNode): Predicate | undefined {
    const simple = this.firstChild(node, 'SimplePredicate');
    if (simple) {
      return {
        kind: 'simple',
        field: this.requiredAttribute(simple, 'field'),
        operator: this.readOperator(simple),
        value: this.requiredAttribute(simple, 'value'),
      };
    }
    if (node.True !== undefined) return { kind: 'true' };
    return undefined;
  }

  private readOperator(predicate: XmlNode): ComparisonOperator {
    const operator = this.requiredAttribute(predicate, 'operator');
    const supported = COMPARISON_OPERATORS.find((candidate) => candidate === operator);
    if (!supported) {
      throw new UnsupportedPmmlFeatureError(`Unknown SimplePredicate operator: ${operator}`);
    }
    return supported;
  }

  private asRecord(value: unknown): XmlNode | undefined {
    return typeof value === 'object' && value !== null ? (value as XmlNode) : undefined;
  }

  private children(node: XmlNode, name: string): XmlNode[] {
    const value = node[name];
    if (value === undefined) return [];
    const list: unknown[] = Array.isArray(value) ? value : [value];
    return list
      .map((child) => this.asRecord(child))
      .filter((child): child is XmlNode => child !== undefined);
  }

  private firstChild(node: XmlNode, name: string): XmlNode | undefined {
    return this.children(node, name).at(0);
  }

  private attribute(node: XmlNode, name: string): string | undefined {
    const value = node[`@_${name}`];
    return value === undefined || value === null ? undefined : String(value);
  }

  private requiredAttribute(node: XmlNode, name: string): string {
    const value = this.attribute(node, name);
    if (value === undefined) throw new PmmlParseError(`Missing required attribute '${name}'`);
    return value;
  }
}
