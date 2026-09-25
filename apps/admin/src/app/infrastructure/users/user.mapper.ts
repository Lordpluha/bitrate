import type { ResourceStatus } from '@domain/shared'
import type { User, UserDetail, UserSortField } from '@domain/user'
import type { UserDetailDto, UserDto, WireUserSortField, WireUserStatus } from './user.dto'

/** See `artist.mapper.ts`'s `TO_WIRE_SORT`. */
const TO_WIRE_SORT = {
  username: 'username',
  email: 'email',
  createdAt: 'createdAt',
} as const satisfies Record<UserSortField, NonNullable<WireUserSortField>>

export function toWireUserSort(field: UserSortField): NonNullable<WireUserSortField> {
  return TO_WIRE_SORT[field]
}

/**
 * See `artist.mapper.ts`'s `TO_WIRE_STATUS` — spelled out rather than returned as-is, so a
 * status value the API drops later is a compile error here instead of a 400 an operator's click
 * triggers.
 */
const TO_WIRE_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
  all: 'all',
} as const satisfies Record<ResourceStatus, NonNullable<WireUserStatus>>

export function toWireUserStatus(status: ResourceStatus): NonNullable<WireUserStatus> {
  return TO_WIRE_STATUS[status]
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

export function toUserDetail(dto: UserDetailDto): UserDetail {
  return {
    ...toUser(dto),
    counts: dto.counts,
  }
}
