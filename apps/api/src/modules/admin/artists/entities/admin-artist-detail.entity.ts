import { ApiProperty } from '@nestjs/swagger'
import { AdminArtistEntity } from './admin-artist.entity'
import { AdminArtistCountsEntity } from './admin-artist-counts.entity'

/** An artist's full operator detail view — the directory row plus activity counts. */
export class AdminArtistDetailEntity extends AdminArtistEntity {
  /** Activity counts for this artist. */
  @ApiProperty({ type: AdminArtistCountsEntity })
  counts: AdminArtistCountsEntity
}
