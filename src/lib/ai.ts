export function asText(result: string | Record<string, unknown>): string {
  return typeof result === 'string' ? result : JSON.stringify(result, null, 2)
}

export function asObject<T extends Record<string, unknown>>(
  result: string | Record<string, unknown>,
): T {
  if (typeof result === 'object' && result !== null) return result as T
  if (typeof result === 'string') {
    try {
      return JSON.parse(result) as T
    } catch {
      return {} as T
    }
  }
  return {} as T
}

export function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}
