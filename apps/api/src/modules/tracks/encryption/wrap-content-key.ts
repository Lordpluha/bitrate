import { createCipheriv, randomBytes } from 'node:crypto'
import {
  type ContentKey,
  KEY_WRAP_ALGORITHM,
  kekBytes,
  type WrappedContentKey,
} from './content-key.types'

/**
 * Wraps a content key under the key-encryption key with AES-256-GCM and a fresh 96-bit nonce.
 * The key id is the additional authenticated data, so a wrapped key cannot be moved to another
 * track's key id.
 * @throws Error when `kek` is not 32 bytes of hex.
 */
export function wrapContentKey({ keyId, key }: ContentKey, kek: string): WrappedContentKey {
  const iv = randomBytes(12)
  const cipher = createCipheriv(KEY_WRAP_ALGORITHM, kekBytes(kek), iv)
  cipher.setAAD(Buffer.from(keyId, 'hex'))
  const wrappedKey = Buffer.concat([cipher.update(Buffer.from(key, 'hex')), cipher.final()])
  return { wrappedKey, iv, authTag: cipher.getAuthTag() }
}
