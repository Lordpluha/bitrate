import type { UserEntity } from '@modules/users/entities'

/** Defines the user auth request. */
export type UserAuthRequest = {
  user: UserEntity
}
