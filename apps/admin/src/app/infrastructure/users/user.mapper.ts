import type { User } from '@domain/user'
import type { UserDto } from './user.dto'

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    emailVerifiedAt: dto.emailVerifiedAt === null ? null : new Date(dto.emailVerifiedAt),
    createdAt: new Date(dto.createdAt),
    deactivatedAt: dto.deletedAt === null ? null : new Date(dto.deletedAt),
  }
}
