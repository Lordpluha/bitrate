import { ApiProperty } from '@nestjs/swagger'
import { AdminTrackEntity } from './admin-track.entity'
import { AdminTrackAlbumEntity } from './admin-track-album.entity'
import { AdminTrackArtistCreditEntity } from './admin-track-artist-credit.entity'
import { AdminTrackFileEntity } from './admin-track-file.entity'
import { AdminTrackGenreEntity } from './admin-track-genre.entity'

/** A track's full operator detail view — the list row plus its renditions, credits, genres,
 * albums, and open report count. */
export class AdminTrackDetailEntity extends AdminTrackEntity {
  /** The stored audio renditions. */
  @ApiProperty({ type: [AdminTrackFileEntity] })
  audioFiles: AdminTrackFileEntity[]

  /** The credited artists. */
  @ApiProperty({ type: [AdminTrackArtistCreditEntity] })
  artists: AdminTrackArtistCreditEntity[]

  /** The attached genres. */
  @ApiProperty({ type: [AdminTrackGenreEntity] })
  genres: AdminTrackGenreEntity[]

  /** The albums this track appears on. */
  @ApiProperty({ type: [AdminTrackAlbumEntity] })
  albums: AdminTrackAlbumEntity[]

  /** How many `OPEN` moderation reports name this track. */
  @ApiProperty()
  openReportCount: number
}
