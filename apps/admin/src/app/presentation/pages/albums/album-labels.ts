import type { AlbumType } from '@domain/album'

/** Album types share the release vocabulary — the albums list and the album page agree. */
export const ALBUM_TYPE_KEY: Record<AlbumType, string> = {
  ALBUM: 'release.kind.ALBUM',
  SINGLE: 'release.kind.SINGLE',
  EP: 'release.kind.EP',
  COMPILATION: 'release.kind.COMPILATION',
}
