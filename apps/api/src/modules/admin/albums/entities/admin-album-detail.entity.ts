import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AdminAlbumEntity } from './admin-album.entity'
import { AdminAlbumTrackEntity } from './admin-album-track.entity'

/** An album's full operator detail view — the list row plus its metadata and tracks. */
export class AdminAlbumDetailEntity extends AdminAlbumEntity {
  /** The album description, if any. */
  @ApiPropertyOptional({ nullable: true })
  description: string | null

  /** The record label, if any. */
  @ApiPropertyOptional({ nullable: true })
  label: string | null

  /** The copyright line, if any. */
  @ApiPropertyOptional({ nullable: true })
  copyright: string | null

  /** The album's tracks, ordered by disc then track number. */
  @ApiProperty({ type: [AdminAlbumTrackEntity] })
  tracks: AdminAlbumTrackEntity[]
}
