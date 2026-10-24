import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DmnMappingError, type HitPolicy, PmmlToDmnConverter, parseHitPolicy } from '../src/index';

const CREDIT_SCORE_PMML = readFileSync('examples/credit-score.pmml', 'utf8');
const CREDIT_SCORE_DMN = readFileSync('examples/credit-score.dmn', 'utf8');

const metadata = {
  modelId: 'credit-risk-v1',
  modelName: 'Credit Risk Model',
  decisionId: 'assess-risk',
  decisionName: 'Assess Credit Risk',
};

const deterministic = new PmmlToDmnConverter({ deterministicIds: true });

async function deterministicConvert(pmml: string, hitPolicy?: HitPolicy): Promise<string> {
  return (await deterministic.convert(pmml, { ...metadata, hitPolicy })).xml;
}

describe('PmmlToDmnConverter', () => {
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

  it('restarts the deterministic ids for every conversion', async () => {
    const first = await deterministicConvert(CREDIT_SCORE_PMML);
    const second = await deterministicConvert(CREDIT_SCORE_PMML);
    expect(second).toBe(first);
  });

  it('returns the structured model next to the XML', async () => {
    const { model } = await deterministic.convert(CREDIT_SCORE_PMML, metadata);
    expect(model.decision.table.rules).toHaveLength(2);
  });

  it('generates random ids by default', async () => {
    const { xml } = await new PmmlToDmnConverter().convert(CREDIT_SCORE_PMML, metadata);
    expect(xml).toMatch(/id="DecisionTable_[0-9a-f]{32}"/);
  });

  it('produces byte-identical output across concurrent runs', async () => {
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
    const dmn = await deterministicConvert(CREDIT_SCORE_PMML, 'ANY');
    expect(dmn).toContain('hitPolicy="ANY"');
  });

  it('omits the attribute for UNIQUE, the DMN default', async () => {
    const dmn = await deterministicConvert(CREDIT_SCORE_PMML, 'UNIQUE');
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
