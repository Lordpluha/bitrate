import { randomBytes } from 'node:crypto'
import type { ContentKey } from './content-key.types'

/** A fresh random 128-bit content key and key id for one track generation (ADR-0077 D2). */
export function generateContentKey(): ContentKey {
  return { keyId: randomBytes(16).toString('hex'), key: randomBytes(16).toString('hex') }
}
