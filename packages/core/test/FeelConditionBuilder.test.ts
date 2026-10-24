import { describe, expect, it } from 'vitest';
import { FeelConditionBuilder } from '../src/map/FeelConditionBuilder';
import type { ComparisonOperator, SimplePredicate } from '../src/model/pmml';

function predicate(operator: ComparisonOperator, value: string): SimplePredicate {
  return { kind: 'simple', field: 'score', operator, value };
}

describe('FeelConditionBuilder', () => {
  const conditions = new FeelConditionBuilder();
  const continuous = (...predicates: SimplePredicate[]) =>
    conditions.build('continuous', predicates);

  it('renders a single lower bound as a comparison', () => {
    expect(continuous(predicate('greaterOrEqual', '50'))).toBe('>= 50');
  });

  it('renders a single upper bound as a comparison', () => {
    expect(continuous(predicate('lessThan', '50'))).toBe('< 50');
  });

  it('combines exclusive bounds into an open interval', () => {
    expect(continuous(predicate('greaterThan', '10'), predicate('lessThan', '20'))).toBe(
      ']10..20[',
    );
  });

  it('combines inclusive bounds into a closed interval', () => {
    expect(continuous(predicate('greaterOrEqual', '10'), predicate('lessOrEqual', '20'))).toBe(
      '[10..20]',
    );
  });

  it('simplifies redundant lower bounds to the tightest', () => {
    expect(continuous(predicate('greaterThan', '10'), predicate('greaterThan', '30'))).toBe('> 30');
  });

  it('wraps categorical values in quotes', () => {
    expect(conditions.build('categorical', [predicate('equal', 'SUNNY')])).toBe('"SUNNY"');
  });

  it('renders an input without predicates as an empty condition', () => {
    expect(conditions.build('continuous', [])).toBe('');
  });
});
