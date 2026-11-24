/** A track's content key and its id, both 128-bit lowercase hex (ADR-0077). */
export type ContentKey = { keyId: string; key: string }

/** A content key as stored: AES-256-GCM ciphertext with its nonce and tag, bound to `keyId`. */
export type WrappedContentKey = { wrappedKey: Buffer; iv: Buffer; authTag: Buffer }

/** A stored row: the key id plus its wrapped key. */
export type StoredContentKey = WrappedContentKey & { keyId: string }

/** AES-256-GCM, the key-encryption algorithm. */
export const KEY_WRAP_ALGORITHM = 'aes-256-gcm'

/** 32-byte key-encryption keys, as 64 hex characters (`PLAYBACK_KEY_ENCRYPTION_KEY`). */
const KEK_PATTERN = /^[0-9a-f]{64}$/

/** @throws Error when `kek` is not 32 bytes of lowercase hex. */
export function kekBytes(kek: string): Buffer {
  if (!KEK_PATTERN.test(kek)) throw new Error('Key-encryption key must be 64 hex characters')
  return Buffer.from(kek, 'hex')
}
