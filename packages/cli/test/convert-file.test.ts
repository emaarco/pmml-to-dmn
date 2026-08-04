import { describe, expect, it } from 'vitest';
import { convertFile } from '../src/convert-file';

describe('convertFile', () => {
  it('converts a PMML file to deterministic DMN', async () => {
    const dmn = await convertFile('examples/credit-score.pmml', {
      modelId: 'm1',
      modelName: 'Model',
      decisionId: 'd1',
      decisionName: 'Decision',
      deterministic: true,
    });
    expect(dmn).toContain('id="m1"');
    expect(dmn).toContain('<dmn:text>&gt;= 50</dmn:text>');
    expect(dmn).toContain('<dmn:text>"PASS"</dmn:text>');
  });

  it('rejects on a missing file', async () => {
    await expect(
      convertFile('does-not-exist.pmml', {
        modelId: 'm',
        modelName: 'M',
        decisionId: 'd',
        decisionName: 'D',
      }),
    ).rejects.toThrow();
  });
});
