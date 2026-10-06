import { ApiProperty } from '@nestjs/swagger'

/** One track on a playlist, as seen from the operator playlist detail page. */
export class AdminPlaylistTrackEntity {
  /** The track's id. */
  @ApiProperty()
  id: string

  /** The track's title. */
  @ApiProperty()
  title: string

  /** The track's position in the playlist, zero-based. */
  @ApiProperty()
  position: number
}
