/** A non-empty, trimmed string field of an untrusted tool input, or `undefined`. */
export function readStringField(input: unknown, field: string): string | undefined {
  if (typeof input !== 'object' || input === null || !(field in input)) return undefined
  const value: unknown = Reflect.get(input, field)
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}
