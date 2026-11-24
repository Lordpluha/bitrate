import { createDecipheriv } from 'node:crypto'
import { KEY_WRAP_ALGORITHM, kekBytes, type StoredContentKey } from './content-key.types'

/**
 * Recovers the content key, as lowercase hex, from its stored row.
 * @throws Error for another key-encryption key, another key id or tampered bytes (GCM tag check).
 */
export function unwrapContentKey(
  { keyId, wrappedKey, iv, authTag }: StoredContentKey,
  kek: string,
): string {
  const decipher = createDecipheriv(KEY_WRAP_ALGORITHM, kekBytes(kek), iv)
  decipher.setAAD(Buffer.from(keyId, 'hex'))
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(wrappedKey), decipher.final()]).toString('hex')
}
