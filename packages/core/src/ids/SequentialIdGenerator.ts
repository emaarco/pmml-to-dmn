import type { IdGenerator } from './IdGenerator';

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  next(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${this.counter}`;
  }
}
