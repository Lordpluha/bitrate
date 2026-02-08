import type { UserEntity } from '../../entities'

export const buildUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
  id: 'user-1',
  username: 'user',
  email: 'user@example.com',
  password: 'hashed-password',
  avatar: null,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
