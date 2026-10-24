import type { IdGenerator } from './IdGenerator';

export class RandomIdGenerator implements IdGenerator {
  next(prefix: string): string {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
  }
}
