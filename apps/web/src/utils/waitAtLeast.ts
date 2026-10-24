export function waitAtLeast(minimumMs: number, startedAt: number): Promise<void> {
  const remaining = minimumMs - (performance.now() - startedAt);
  return remaining > 0
    ? new Promise((resolve) => setTimeout(resolve, remaining))
    : Promise.resolve();
}
