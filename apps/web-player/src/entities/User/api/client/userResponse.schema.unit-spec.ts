import { describe, expect, it } from 'vitest'
import { mergePublicUserIntoAuthUser } from './hooks'
import { publicUserResponseSchema } from './userResponse.schema'

describe('publicUserResponseSchema', () => {
  it('accepts the public API projection without an email', () => {
    const user = publicUserResponseSchema.parse({
      avatar: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      description: null,
      id: 'user-1',
      updatedAt: '2026-01-01T00:00:00.000Z',
      username: 'listener',
    })

    expect(user.username).toBe('listener')
  })

  it('does not expose internal authentication state returned by an old API', () => {
    const user = publicUserResponseSchema.parse({
      avatar: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      description: null,
      email: 'private@example.com',
      failedLoginAttempts: 4,
      id: 'user-1',
      lockedUntil: '2026-01-02T00:00:00.000Z',
      twoFactorEnabled: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
      username: 'listener',
    })

    expect(user).not.toHaveProperty('email')
    expect(user).not.toHaveProperty('failedLoginAttempts')
    expect(user).not.toHaveProperty('lockedUntil')
    expect(user).not.toHaveProperty('twoFactorEnabled')
  })

  it('updates public profile fields without discarding private auth cache fields', () => {
    const publicUser = publicUserResponseSchema.parse({
      avatar: '/static/users/avatars/new.png',
      createdAt: '2026-01-01T00:00:00.000Z',
      description: null,
      id: 'user-1',
      updatedAt: '2026-01-02T00:00:00.000Z',
      username: 'listener',
    })

    expect(
      mergePublicUserIntoAuthUser(
        { email: 'private@example.com', twoFactorEnabled: true },
        publicUser,
      ),
    ).toMatchObject({
      avatar: '/static/users/avatars/new.png',
      email: 'private@example.com',
      twoFactorEnabled: true,
    })
  })
})
