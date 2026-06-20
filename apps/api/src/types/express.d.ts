import type { ArtistEntity } from '@modules/artists/entities/artist.entity'
import type { UserEntity } from '@modules/users/entities/user.entity'

declare module 'express' {
  interface Request {
    user?: UserEntity
    artist?: ArtistEntity
  }
}
