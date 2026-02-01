import { registerAs } from '@nestjs/config'
import { join } from 'path'

export const storageConfigFactory = registerAs('storage', () => ({
  publicPath: join(process.cwd(), 'storage', 'public'),
  privatePath: join(process.cwd(), 'storage', 'private'),

  getPrivateRoot: (path?: string) => join(process.cwd(), 'storage', 'private', path ?? ''),
  getPublicRoot: (path?: string) => join(process.cwd(), 'storage', 'public', path ?? ''),

  getTracksDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'private', 'tracks', fileName ?? ''),
  getTracksCoversDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'public', 'tracks', 'covers', fileName ?? ''),

  getAlbumsCoversDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'public', 'albums', 'covers', fileName ?? ''),

  getArtistsAvatarsDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'public', 'artists', 'avatars', fileName ?? ''),
  getArtistsBackgroundsDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'public', 'artists', 'backgrounds', fileName ?? ''),

  getPlaylistsCoversDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'public', 'playlists', 'covers', fileName ?? ''),

  getUsersAvatarsDir: (fileName?: string) =>
    join(process.cwd(), 'storage', 'public', 'users', 'avatars', fileName ?? ''),
}))
