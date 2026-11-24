import { describe, expect, it } from '@jest/globals'
import { canAccessConversation } from './can-access-conversation'
import { createGuestToken, hashGuestToken } from './guest-token'

describe('canAccessConversation', () => {
  const token = createGuestToken()
  const guest = { userId: null, guestTokenHash: hashGuestToken(token) }
  const owned = { userId: 'u1', guestTokenHash: null }

  it('opens a guest conversation with its token only', () => {
    expect(canAccessConversation(guest, { token })).toBe(true)
    expect(canAccessConversation(guest, { token: createGuestToken() })).toBe(false)
    expect(canAccessConversation(guest, {})).toBe(false)
  })

  it('opens a listener’s conversation for that listener only, token or not', () => {
    expect(canAccessConversation(owned, { userId: 'u1' })).toBe(true)
    expect(canAccessConversation(owned, { userId: 'u2' })).toBe(false)
    expect(canAccessConversation(owned, { token })).toBe(false)
  })

  it('creates distinct, URL-safe tokens', () => {
    const second = createGuestToken()
    expect(second).not.toBe(token)
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })
})
