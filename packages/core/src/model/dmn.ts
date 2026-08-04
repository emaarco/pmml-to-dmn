/** DOM-free representation of the DMN model that gets serialized to XML. */
export interface DmnModel {
  readonly id: string;
  readonly name: string;
  readonly decision: Decision;
}

export interface Decision {
  readonly id: string;
  readonly name: string;
  readonly table: DecisionTable;
}

export interface DecisionTable {
  readonly id: string;
  readonly inputs: readonly InputColumn[];
  readonly output: OutputColumn;
  readonly rules: readonly DmnRule[];
}

export interface InputColumn {
  readonly id: string;
  readonly inputExpressionId: string;
  readonly label: string;
  readonly typeRef: string;
  readonly expressionText: string;
}

export interface OutputColumn {
  readonly id: string;
  readonly name: string;
  readonly typeRef: string;
}

export interface DmnRule {
  readonly id: string;
  readonly inputEntries: readonly InputEntry[];
  readonly outputEntry: OutputEntry;
}

export interface InputEntry {
  readonly id: string;
  readonly feel: string;
}

export interface OutputEntry {
  readonly id: string;
  readonly text: string;
}
