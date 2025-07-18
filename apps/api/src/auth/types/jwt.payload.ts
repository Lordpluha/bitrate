import { UserEntity } from 'src/users/entities'

export type JWTPayload = {
  sub: string
  username: UserEntity['username']
}
