import { DmnMappingError } from '../model/errors';
import { FEEL_SYMBOL, type SimplePredicate } from '../model/pmml';

/** An empty condition — the input is not relevant for this rule. */
export function emptyCondition(): string {
  return '';
}

/** A categorical condition: the value as a quoted FEEL string literal. */
export function categoricalCondition(value: string): string {
  return `"${value}"`;
}

/**
 * A numerical condition. Overlapping/redundant bounds along a tree path are simplified into a
 * single FEEL comparison (`>= 50`) or range (`]10..20]`).
 */
export function numericalCondition(predicates: readonly SimplePredicate[]): string {
  const raw = predicates.map((p): [string, number] => [FEEL_SYMBOL[p.operator], Number(p.value)]);
  const conditions = simplify(groupByComparator(raw));

  if (conditions.length === 1) {
    const only = conditions.at(0);
    if (!only) throw new DmnMappingError('No numerical condition found');
    return `${only[0]} ${only[1]}`;
  }
  if (conditions.length > 1) {
    return conditions.map(disjunction).join('..');
  }
  throw new DmnMappingError('No numerical condition found');
}

function groupByComparator(raw: ReadonlyArray<[string, number]>): Map<string, number[]> {
  const grouped = new Map<string, number[]>();
  for (const [symbol, value] of raw) {
    const values = grouped.get(symbol) ?? [];
    values.push(value);
    grouped.set(symbol, values);
  }
  return grouped;
}

/** Keep only the tightest lower and upper bound; sort by value. */
function simplify(grouped: Map<string, number[]>): Array<[string, number]> {
  const boundary = new Map<string, number>();
  for (const [symbol, values] of grouped) {
    boundary.set(symbol, boundaryValue(symbol, values));
  }

  const result: Array<[string, number]> = [];
  const lower = lowerLimit(boundary);
  if (lower) result.push(lower);
  const upper = upperLimit(boundary);
  if (upper) result.push(upper);
  return result.sort((a, b) => a[1] - b[1]);
}

function boundaryValue(symbol: string, values: number[]): number {
  if (values.length === 0) throw new DmnMappingError('Empty numerical condition list');
  return symbol === '>' || symbol === '>=' ? Math.max(...values) : Math.min(...values);
}

function lowerLimit(boundary: Map<string, number>): [string, number] | undefined {
  let best: [string, number] | undefined;
  for (const [symbol, value] of boundary) {
    if (symbol.includes('<') && (best === undefined || value < best[1])) best = [symbol, value];
  }
  return best;
}

function upperLimit(boundary: Map<string, number>): [string, number] | undefined {
  let best: [string, number] | undefined;
  for (const [symbol, value] of boundary) {
    if (symbol.includes('>') && (best === undefined || value > best[1])) best = [symbol, value];
  }
  return best;
}

function disjunction([symbol, value]: [string, number]): string {
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
