export function normalizeRef<T>(ref: T | T[] | null): T | null {
  if (!ref) return null;
  return Array.isArray(ref) ? (ref[0] ?? null) : ref;
}
