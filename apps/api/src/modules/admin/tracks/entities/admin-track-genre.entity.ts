import { ApiProperty } from '@nestjs/swagger'

/** A genre attached to a track, as seen by the operator surface. */
export class AdminTrackGenreEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The name value. */
  @ApiProperty()
  name: string

  /** The slug value. */
  @ApiProperty()
  slug: string
}
