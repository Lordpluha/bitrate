import type { User, UserSortField } from '@domain/user'
import type { UserDto, WireUserSortField } from './user.dto'

/** See `artist.mapper.ts`'s `TO_WIRE_SORT`. */
const TO_WIRE_SORT = {
  username: 'username',
  email: 'email',
  createdAt: 'createdAt',
} as const satisfies Record<UserSortField, NonNullable<WireUserSortField>>

export function toWireUserSort(field: UserSortField): NonNullable<WireUserSortField> {
  return TO_WIRE_SORT[field]
}

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
