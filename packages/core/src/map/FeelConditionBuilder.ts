import { DmnMappingError } from '../model/errors';
import type { ComparisonOperator, SimplePredicate } from '../model/pmml';

type Bound = readonly [symbol: string, value: number];

const FEEL_SYMBOL: Readonly<Record<ComparisonOperator, string>> = {
  equal: '',
  notEqual: '!=',
  lessThan: '<',
  lessOrEqual: '<=',
  greaterThan: '>',
  greaterOrEqual: '>=',
};

export class FeelConditionBuilder {
  build(opType: string, predicates: readonly SimplePredicate[]): string {
    const [first] = predicates;
    if (!first) return '';
    if (opType === 'continuous') return this.numericalCondition(predicates);
    return `"${first.value}"`;
  }

  private numericalCondition(predicates: readonly SimplePredicate[]): string {
    const bounds = this.tightestBounds(predicates);
    const [only] = bounds;
    if (bounds.length === 1 && only) return `${only[0]} ${only[1]}`;
    if (bounds.length > 1) return bounds.map((bound) => this.intervalEndpoint(bound)).join('..');
    throw new DmnMappingError('No numerical condition found');
  }

  private tightestBounds(predicates: readonly SimplePredicate[]): Bound[] {
    const boundaryBySymbol = new Map<string, number>();
    for (const [symbol, values] of this.valuesBySymbol(predicates)) {
      const isLowerBound = symbol.includes('>');
      boundaryBySymbol.set(symbol, isLowerBound ? Math.max(...values) : Math.min(...values));
    }

    const upper = this.tightestUpperBound(boundaryBySymbol);
    const lower = this.tightestLowerBound(boundaryBySymbol);
    return [upper, lower]
      .filter((bound): bound is Bound => bound !== undefined)
      .sort((a, b) => a[1] - b[1]);
  }

  private valuesBySymbol(predicates: readonly SimplePredicate[]): Map<string, number[]> {
    const grouped = new Map<string, number[]>();
    for (const predicate of predicates) {
      const symbol = FEEL_SYMBOL[predicate.operator];
      grouped.set(symbol, [...(grouped.get(symbol) ?? []), Number(predicate.value)]);
    }
    return grouped;
  }

  private tightestUpperBound(boundaryBySymbol: Map<string, number>): Bound | undefined {
    let tightest: Bound | undefined;
    for (const [symbol, value] of boundaryBySymbol) {
      if (symbol.includes('<') && (tightest === undefined || value < tightest[1])) {
        tightest = [symbol, value];
      }
    }
    return tightest;
  }

  private tightestLowerBound(boundaryBySymbol: Map<string, number>): Bound | undefined {
    let tightest: Bound | undefined;
    for (const [symbol, value] of boundaryBySymbol) {
      if (symbol.includes('>') && (tightest === undefined || value > tightest[1])) {
        tightest = [symbol, value];
      }
    }
    return tightest;
  }

  private intervalEndpoint([symbol, value]: Bound): string {
    switch (symbol) {
      case '>=':
        return `[${value}`;
      case '>':
        return `]${value}`;
      case '<=':
        return `${value}]`;
      case '<':
        return `${value}[`;
      default:
        throw new DmnMappingError(`Operator ${symbol} not supported as numerical operator`);
    }
  }
}
