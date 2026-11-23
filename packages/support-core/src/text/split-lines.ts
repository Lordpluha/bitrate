/** Lines without their `\n` / `\r\n` terminators. */
export function splitLines(text: string): string[] {
  return text.split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line))
}
