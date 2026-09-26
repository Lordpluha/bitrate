import { ApiProperty } from '@nestjs/swagger'

/** The minimal owner summary embedded in a populated playlist response. */
export class PlaylistOwnerEntity {
  /** The owning user's id. */
  @ApiProperty()
  id: string

  /** The owning user's username. */
  @ApiProperty()
  username: string

  /** The owning user's avatar URL. */
  @ApiProperty({ nullable: true })
  avatar: string | null
}
