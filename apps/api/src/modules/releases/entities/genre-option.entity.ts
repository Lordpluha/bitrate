import { ApiProperty } from '@nestjs/swagger'

export class GenreOptionEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ example: 'house' })
  slug: string

  @ApiProperty({ example: 'House' })
  name: string
}
