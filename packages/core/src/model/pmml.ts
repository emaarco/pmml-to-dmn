/**
 * A minimal, DOM-free representation of the subset of PMML this converter supports:
 * a single decision TreeModel with a data dictionary and a mining schema.
 */
export interface PmmlModel {
  readonly dataFields: readonly DataField[];
  readonly miningFields: readonly MiningField[];
  readonly root: PmmlNode;
}

export interface DataField {
  readonly name: string;
  readonly dataType: string;
  /** PMML optype, e.g. `continuous` or `categorical`. */
  readonly opType: string;
}

export interface MiningField {
  readonly name: string;
  readonly usageType?: string;
}

/** A single node of the PMML decision tree. */
export interface PmmlNode {
  readonly id?: string;
  readonly score?: string;
  readonly predicate?: Predicate;
  readonly children: readonly PmmlNode[];
}

/** Predicate attached to a tree node. Only simple and `<True/>` predicates are supported. */
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

/** The comparison operators supported inside a SimplePredicate. */
export type ComparisonOperator =
  | 'equal'
  | 'notEqual'
  | 'lessThan'
  | 'lessOrEqual'
  | 'greaterThan'
  | 'greaterOrEqual';

/** FEEL symbol for each PMML operator. */
export const FEEL_SYMBOL: Readonly<Record<ComparisonOperator, string>> = {
  equal: '',
  notEqual: '!=',
  lessThan: '<',
  lessOrEqual: '<=',
  greaterThan: '>',
  greaterOrEqual: '>=',
};

const PMML_OPERATORS = Object.keys(FEEL_SYMBOL) as ComparisonOperator[];

export function isComparisonOperator(value: string): value is ComparisonOperator {
  return (PMML_OPERATORS as string[]).includes(value);
}
