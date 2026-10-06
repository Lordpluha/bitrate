import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AdminPlaylistEntity } from './admin-playlist.entity'
import { AdminPlaylistTrackEntity } from './admin-playlist-track.entity'

/** A playlist's full operator detail view — the list row plus its metadata and first tracks. */
export class AdminPlaylistDetailEntity extends AdminPlaylistEntity {
  /** The playlist description, if any. */
  @ApiPropertyOptional({ nullable: true })
  description: string | null

  /** Whether other users may add tracks. */
  @ApiProperty()
  collaborative: boolean

  /** The first 50 tracks in playlist order; `trackCount` holds the full total. */
  @ApiProperty({ type: [AdminPlaylistTrackEntity] })
  tracks: AdminPlaylistTrackEntity[]
}
