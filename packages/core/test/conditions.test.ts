import { describe, expect, it } from 'vitest';
import { categoricalCondition, emptyCondition, numericalCondition } from '../src/map/conditions';
import type { ComparisonOperator, SimplePredicate } from '../src/model/pmml';

function predicate(operator: ComparisonOperator, value: string): SimplePredicate {
  return { kind: 'simple', field: 'score', operator, value };
}

describe('numericalCondition', () => {
  it('renders a single lower bound as a comparison', () => {
    expect(numericalCondition([predicate('greaterOrEqual', '50')])).toBe('>= 50');
  });

  it('renders a single upper bound as a comparison', () => {
    expect(numericalCondition([predicate('lessThan', '50')])).toBe('< 50');
  });

  it('combines exclusive bounds into an open interval', () => {
    expect(numericalCondition([predicate('greaterThan', '10'), predicate('lessThan', '20')])).toBe(
      ']10..20[',
    );
  });

  it('combines inclusive bounds into a closed interval', () => {
    expect(
      numericalCondition([predicate('greaterOrEqual', '10'), predicate('lessOrEqual', '20')]),
    ).toBe('[10..20]');
  });

  it('simplifies redundant lower bounds to the tightest', () => {
    expect(
      numericalCondition([predicate('greaterThan', '10'), predicate('greaterThan', '30')]),
    ).toBe('> 30');
  });
});

describe('simple conditions', () => {
  it('wraps categorical values in quotes', () => {
    expect(categoricalCondition('SUNNY')).toBe('"SUNNY"');
  });

  it('renders an empty condition as an empty string', () => {
    expect(emptyCondition()).toBe('');
  });
});
