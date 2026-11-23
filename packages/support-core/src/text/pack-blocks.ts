/**
 * Joins blocks with blank lines into as few parts as possible, each at most `limit`
 * characters. A block longer than the limit stays a part of its own.
 */
export function packBlocks(blocks: readonly string[], limit: number): string[] {
  const parts: string[] = []
  let current = ''
  for (const block of blocks) {
    const candidate = current === '' ? block : `${current}\n\n${block}`
    if (candidate.length <= limit) {
      current = candidate
    } else {
      if (current !== '') parts.push(current)
      current = block
    }
  }
  if (current !== '') parts.push(current)
  return parts
}
