export interface PmmlModel {
  readonly dataFields: readonly DataField[];
  readonly miningFields: readonly MiningField[];
  readonly root: PmmlNode;
}

export interface DataField {
  readonly name: string;
  readonly dataType: string;
  readonly opType: string;
}

export interface MiningField {
  readonly name: string;
  readonly usageType?: string;
}

export interface PmmlNode {
  readonly id?: string;
  readonly score?: string;
  readonly predicate?: Predicate;
  readonly children: readonly PmmlNode[];
}

export type Predicate = SimplePredicate | TruePredicate;

export interface SimplePredicate {
  readonly kind: 'simple';
  readonly field: string;
  readonly operator: ComparisonOperator;
  readonly value: string;
}

export interface TruePredicate {
  readonly kind: 'true';
}

export const COMPARISON_OPERATORS = [
  'equal',
  'notEqual',
  'lessThan',
  'lessOrEqual',
  'greaterThan',
  'greaterOrEqual',
] as const;

export type ComparisonOperator = (typeof COMPARISON_OPERATORS)[number];
