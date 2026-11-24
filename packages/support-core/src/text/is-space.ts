/** A space or tab: the separators Markdown block syntax allows after a marker. */
export function isSpace(char: string | undefined): boolean {
  return char === ' ' || char === '\t'
}
