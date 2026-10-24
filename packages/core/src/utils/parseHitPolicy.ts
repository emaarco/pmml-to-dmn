import { HIT_POLICIES, type HitPolicy } from '../model/dmn';
import { DmnMappingError } from '../model/errors';

export function parseHitPolicy(value: string): HitPolicy {
  const match = HIT_POLICIES.find((policy) => policy === value);
  if (!match) {
    throw new DmnMappingError(
      `Unsupported hit policy '${value}'. Use one of: ${HIT_POLICIES.join(', ')}`,
    );
  }
  return match;
}
