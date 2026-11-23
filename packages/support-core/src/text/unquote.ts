/** Removes one pair of matching surrounding quotes, after trimming. */
export function unquote(value: string): string {
  const text = value.trim()
  const first = text[0]
  if (text.length >= 2 && (first === '"' || first === "'") && text.endsWith(first)) {
    return text.slice(1, -1)
  }
  return text
}
