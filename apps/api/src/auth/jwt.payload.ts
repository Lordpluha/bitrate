import { User } from '@prisma/client'

export type JWTPayload = {
  sub: string
  username: User['username']
}
