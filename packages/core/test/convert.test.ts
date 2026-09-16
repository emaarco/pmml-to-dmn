import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { convert, DmnMappingError, parseHitPolicy, sequentialIdGenerator } from '../src/index';

const CREDIT_SCORE_PMML = readFileSync('examples/credit-score.pmml', 'utf8');
const CREDIT_SCORE_DMN = readFileSync('examples/credit-score.dmn', 'utf8');

const command = {
  modelId: 'credit-risk-v1',
  modelName: 'Credit Risk Model',
  decisionId: 'assess-risk',
  decisionName: 'Assess Credit Risk',
};

function deterministicConvert(pmml: string): Promise<string> {
  return convert(pmml, { ...command, idGenerator: sequentialIdGenerator() });
}

describe('convert (end-to-end)', () => {
  it('converts the credit-score tree into the expected DMN', async () => {
    const dmn = await deterministicConvert(CREDIT_SCORE_PMML);
    expect(dmn).toContain('id="credit-risk-v1"');
    expect(dmn).toContain('<dmn:input id="Input_2" label="score">');
    expect(dmn).toContain('name="result" typeRef="string"');
    expect(dmn).toContain('<dmn:text>&gt;= 50</dmn:text>');
    expect(dmn).toContain('<dmn:text>"PASS"</dmn:text>');
    expect(dmn).toContain('<dmn:text>&lt; 50</dmn:text>');
    expect(dmn).toContain('<dmn:text>"FAIL"</dmn:text>');
  });

  it('matches the committed golden DMN', async () => {
    expect(await deterministicConvert(CREDIT_SCORE_PMML)).toBe(CREDIT_SCORE_DMN);
  });

  it('produces byte-identical output across runs', async () => {
    const [first, second] = await Promise.all([
      deterministicConvert(CREDIT_SCORE_PMML),
      deterministicConvert(CREDIT_SCORE_PMML),
    ]);
    expect(first).toBe(second);
  });
});

describe('hit policy', () => {
  it('defaults to FIRST', async () => {
    expect(await deterministicConvert(CREDIT_SCORE_PMML)).toContain('hitPolicy="FIRST"');
  });

  it('applies the configured hit policy', async () => {
    const dmn = await convert(CREDIT_SCORE_PMML, { ...command, hitPolicy: 'ANY' });
    expect(dmn).toContain('hitPolicy="ANY"');
  });

  it('omits the attribute for UNIQUE, the DMN default', async () => {
    const dmn = await convert(CREDIT_SCORE_PMML, { ...command, hitPolicy: 'UNIQUE' });
    expect(dmn).toMatch(/<dmn:decisionTable id="[^"]+">/);
    expect(dmn).not.toContain('hitPolicy=');
  });

  it('parses a supported hit policy', () => {
    expect(parseHitPolicy('ANY')).toBe('ANY');
  });

  it('rejects an unsupported hit policy with the allowed values', () => {
    expect(() => parseHitPolicy('COLLECT')).toThrow(DmnMappingError);
    expect(() => parseHitPolicy('COLLECT')).toThrow(
      "Unsupported hit policy 'COLLECT'. Use one of: UNIQUE, FIRST, ANY",
    );
  });
});
