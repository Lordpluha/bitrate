import { describe, expect, it } from '@jest/globals'
import { generateContentKey } from './generate-content-key'
import { unwrapContentKey } from './unwrap-content-key'
import { wrapContentKey } from './wrap-content-key'

const KEK = 'a'.repeat(64)
const OTHER_KEK = 'b'.repeat(64)

describe('content keys (ADR-0077)', () => {
  it('generates a fresh 128-bit key and key id as lowercase hex', () => {
    const first = generateContentKey()
    const second = generateContentKey()

    expect(first.key).toMatch(/^[0-9a-f]{32}$/)
    expect(first.keyId).toMatch(/^[0-9a-f]{32}$/)
    expect(first.key).not.toBe(second.key)
    expect(first.keyId).not.toBe(second.keyId)
  })

  it('wraps a key so the stored bytes never contain it, and unwraps it back', () => {
    const { key, keyId } = generateContentKey()

    const wrapped = wrapContentKey({ key, keyId }, KEK)

    expect(wrapped.wrappedKey.includes(Buffer.from(key, 'hex'))).toBe(false)
    expect(wrapped.iv).toHaveLength(12)
    expect(wrapped.authTag).toHaveLength(16)
    expect(unwrapContentKey({ keyId, ...wrapped }, KEK)).toBe(key)
  })

  it('uses a new nonce for every wrap', () => {
    const content = generateContentKey()

    expect(wrapContentKey(content, KEK).iv.equals(wrapContentKey(content, KEK).iv)).toBe(false)
  })

  it('refuses another key-encryption key', () => {
    const content = generateContentKey()
    const wrapped = wrapContentKey(content, KEK)

    expect(() => unwrapContentKey({ keyId: content.keyId, ...wrapped }, OTHER_KEK)).toThrow()
  })

  it('refuses a wrapped key moved to another key id', () => {
    const content = generateContentKey()
    const wrapped = wrapContentKey(content, KEK)

    expect(() => unwrapContentKey({ keyId: generateContentKey().keyId, ...wrapped }, KEK)).toThrow()
  })

  it('refuses tampered ciphertext', () => {
    const content = generateContentKey()
    const wrapped = wrapContentKey(content, KEK)
    wrapped.wrappedKey.writeUInt8(wrapped.wrappedKey.readUInt8(0) ^ 0xff, 0)

    expect(() => unwrapContentKey({ keyId: content.keyId, ...wrapped }, KEK)).toThrow()
  })

  it('rejects a key-encryption key that is not 32 bytes of hex', () => {
    expect(() => wrapContentKey(generateContentKey(), 'short')).toThrow(
      'Key-encryption key must be 64 hex characters',
    )
  })
})
