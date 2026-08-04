/** Strategy for the element ids used inside the generated DMN model. */
export type IdGenerator = (prefix: string) => string;

/**
 * Deterministic generator that numbers ids sequentially (`Input_1`, `Input_2`, ...).
 * Produces reproducible, byte-identical DMN output — used for tests and golden files.
 */
export function sequentialIdGenerator(): IdGenerator {
  let counter = 0;
  return (prefix: string) => `${prefix}_${++counter}`;
}

/** Default generator producing random, collision-free ids (`Input_<32 hex chars>`). */
export function uuidIdGenerator(): IdGenerator {
  return (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}
