import { ApiProperty } from '@nestjs/swagger'
import { AlbumType, ReleaseStatus } from '@prisma/client'

/** Summary of an artist-owned preparation workspace, distinct from a public album. */
export class ReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: AlbumType, enumName: 'ReleaseType' })
  type: AlbumType

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({ type: String, nullable: true })
  upc: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  scheduledAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date
}
