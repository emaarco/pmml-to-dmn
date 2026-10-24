import { describe, expect, it } from 'vitest';
import { SequentialIdGenerator } from '../src/ids/SequentialIdGenerator';
import { DmnMapper } from '../src/map/DmnMapper';
import { DmnMappingError } from '../src/model/errors';
import type { PmmlModel, PmmlNode } from '../src/model/pmml';

const metadata = {
  modelId: 'model',
  modelName: 'Model',
  decisionId: 'decision',
  decisionName: 'Decision',
};

function node(
  score: string | undefined,
  field: string,
  operator: 'greaterThan' | 'lessOrEqual',
  value: string,
  children: PmmlNode[] = [],
): PmmlNode {
  return { score, predicate: { kind: 'simple', field, operator, value }, children };
}

const nestedTree: PmmlModel = {
  dataFields: [
    { name: 'Annual Income', dataType: 'double', opType: 'continuous' },
    { name: 'risk', dataType: 'string', opType: 'categorical' },
  ],
  miningFields: [{ name: 'Annual Income' }, { name: 'risk', usageType: 'target' }],
  root: {
    predicate: { kind: 'true' },
    children: [
      node(undefined, 'Annual Income', 'greaterThan', '10', [
        node('LOW', 'Annual Income', 'greaterThan', '50'),
        node('MEDIUM', 'Annual Income', 'lessOrEqual', '50'),
      ]),
      node('HIGH', 'Annual Income', 'lessOrEqual', '10'),
    ],
  },
};

describe('DmnMapper', () => {
  const mapper = new DmnMapper();
  const map = (pmml: PmmlModel) => mapper.map(pmml, metadata, new SequentialIdGenerator());

  it('turns every root-to-leaf path into one rule, combining the bounds along the path', () => {
    const { rules } = map(nestedTree).decision.table;
    expect(rules.map((rule) => [rule.inputEntries[0]?.feel, rule.outputEntry.text])).toEqual([
      ['> 50', '"LOW"'],
      [']10..50]', '"MEDIUM"'],
      ['<= 10', '"HIGH"'],
    ]);
  });

  it('maps every non-target field to an input column with a FEEL variable name', () => {
    const { inputs, output } = map(nestedTree).decision.table;
    expect(inputs.map((input) => input.expressionText)).toEqual(['annual_income']);
    expect(output).toMatchObject({ name: 'risk', typeRef: 'string' });
  });

  it('rejects a tree without a target field', () => {
    expect(() => map({ ...nestedTree, miningFields: [] })).toThrow(DmnMappingError);
  });
});
