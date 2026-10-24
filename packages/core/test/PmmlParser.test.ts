import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PmmlParseError, UnsupportedPmmlFeatureError } from '../src/model/errors';
import { PmmlParser } from '../src/parse/PmmlParser';

const CREDIT_SCORE = readFileSync('examples/credit-score.pmml', 'utf8');

describe('PmmlParser', () => {
  const parser = new PmmlParser();

  it('reads the data dictionary and mining schema', () => {
    const model = parser.parse(CREDIT_SCORE);
    expect(model.dataFields.map((f) => f.name)).toEqual(['score', 'result']);
    expect(model.dataFields.find((f) => f.name === 'score')?.opType).toBe('continuous');
    expect(model.miningFields.find((f) => f.usageType === 'target')?.name).toBe('result');
  });

  it('reads the tree below the root with its predicates and scores', () => {
    const { root } = parser.parse(CREDIT_SCORE);
    expect(root.predicate).toEqual({ kind: 'true' });
    expect(root.children.map((node) => node.score)).toEqual(['PASS', 'FAIL']);
    expect(root.children[0]?.predicate).toEqual({
      kind: 'simple',
      field: 'score',
      operator: 'greaterOrEqual',
      value: '50',
    });
  });

  it('fails clearly on malformed input', () => {
    expect(() => parser.parse('not pmml at all')).toThrow(PmmlParseError);
  });

  it('rejects an unknown predicate operator', () => {
    const pmml = CREDIT_SCORE.replace('operator="lessThan"', 'operator="isMissing"');
    expect(() => parser.parse(pmml)).toThrow(UnsupportedPmmlFeatureError);
  });
});
