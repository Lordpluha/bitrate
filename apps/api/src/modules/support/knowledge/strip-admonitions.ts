/**
 * Removes Docusaurus admonitions (`:::info[Title]` … `:::`). In the legal sources they hold
 * notes for maintainers, which the assistant must not quote as policy. Collapses the blank
 * lines left behind.
 */
export function stripAdmonitions(markdown: string): string {
  const kept: string[] = []
  let inside = false
  for (const line of markdown.split('\n')) {
    const fence = line.trim()
    if (!inside && fence.startsWith(':::') && fence.length > 3) {
      inside = true
    } else if (inside && fence === ':::') {
      inside = false
    } else if (!(inside || (fence === '' && kept.at(-1)?.trim() === ''))) {
      kept.push(line)
    }
  }
  return kept.join('\n').trim()
}
