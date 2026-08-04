import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leafPaths } from '../src/map/map-to-dmn';
import { PmmlParseError } from '../src/model/errors';
import { parsePmml } from '../src/parse/parse-pmml';

const CREDIT_SCORE = readFileSync('examples/credit-score.pmml', 'utf8');

describe('parsePmml', () => {
  it('reads the data dictionary and mining schema', () => {
    const model = parsePmml(CREDIT_SCORE);
    expect(model.dataFields.map((f) => f.name)).toEqual(['score', 'result']);
    expect(model.dataFields.find((f) => f.name === 'score')?.opType).toBe('continuous');
    expect(model.miningFields.find((f) => f.usageType === 'target')?.name).toBe('result');
  });

  it('builds the tree and its leaf paths, excluding the root', () => {
    const model = parsePmml(CREDIT_SCORE);
    const paths = leafPaths(model);
    expect(paths).toHaveLength(2);
    for (const path of paths) {
      expect(path).toHaveLength(1);
      expect(path[0]?.predicate).toMatchObject({ kind: 'simple', field: 'score' });
    }
    expect(paths.map((p) => p.at(-1)?.score)).toEqual(['PASS', 'FAIL']);
  });

  it('fails clearly on malformed input', () => {
    expect(() => parsePmml('not pmml at all')).toThrow(PmmlParseError);
  });
});
