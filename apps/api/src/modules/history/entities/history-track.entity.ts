import { ApiProperty } from '@nestjs/swagger'

/** The minimal artist summary embedded in a history track. */
export class HistoryTrackArtistEntity {
  /** The artist's id. */
  @ApiProperty()
  id: string

  /** The artist's username. */
  @ApiProperty()
  username: string

  /** The artist's avatar URL. */
  @ApiProperty({ nullable: true })
  avatar: string | null
}

/** The minimal track projection embedded in a history entry. */
export class HistoryTrackEntity {
  /** The track's id. */
  @ApiProperty()
  id: string

  /** The track's title. */
  @ApiProperty()
  title: string

  /** The track's cover URL. */
  @ApiProperty({ nullable: true })
  cover: string | null

  /** The track's duration in seconds. */
  @ApiProperty({ nullable: true })
  duration: number | null

  /** The owning artist's id. */
  @ApiProperty()
  artistId: string

  /** The owning artist's summary. */
  @ApiProperty({ type: HistoryTrackArtistEntity })
  artist: HistoryTrackArtistEntity
}
