import { ApiProperty } from '@nestjs/swagger'
import { ArtistTrackStatus, ArtistTrackVersion } from '@prisma/client'
import { ReleaseEntity } from './release.entity'

export class MusicTrackReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string
}

export class MusicTrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  artistName: string

  @ApiProperty({ enum: ArtistTrackVersion, enumName: 'ArtistTrackVersion' })
  version: ArtistTrackVersion

  @ApiProperty({ enum: ArtistTrackStatus, enumName: 'ArtistTrackStatus' })
  status: ArtistTrackStatus

  @ApiProperty({ type: Number, nullable: true, minimum: 0 })
  duration: number | null

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty({ type: String, nullable: true })
  previewUrl: string | null

  @ApiProperty()
  isDemo: boolean

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date

  @ApiProperty({ type: MusicTrackReleaseEntity, nullable: true })
  release: MusicTrackReleaseEntity | null
}

export class MusicReleaseEntity extends ReleaseEntity {
  @ApiProperty()
  artistName: string

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty()
  isDemo: boolean

  @ApiProperty({ minimum: 0 })
  trackCount: number
}

export class MusicCountsEntity {
  @ApiProperty({ minimum: 0 })
  tracks: number

  @ApiProperty({ minimum: 0 })
  releases: number
}
