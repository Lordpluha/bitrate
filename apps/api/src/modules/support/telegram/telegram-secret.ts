import { timingSafeEqual } from 'node:crypto'

/** Compares the webhook's secret token in constant time, so it cannot be guessed byte by byte. */
export function isTelegramSecret(expected: string, received: string | undefined): boolean {
  if (received === undefined) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  return a.length === b.length && timingSafeEqual(a, b)
}
