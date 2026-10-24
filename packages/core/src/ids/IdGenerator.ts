export interface IdGenerator {
  next(prefix: string): string;
}
