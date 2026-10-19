import { ApiProperty } from '@nestjs/swagger'
import { AlbumType, ArtistTrackStatus, ReleaseStatus, ReleaseTaskStatus } from '@prisma/client'

export class SearchReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: AlbumType, enumName: 'AlbumType' })
  type: AlbumType

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus
}

export class SearchTrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ArtistTrackStatus, enumName: 'ArtistTrackStatus' })
  status: ArtistTrackStatus

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  releaseId: string | null
}

export class SearchTaskReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string
}

export class SearchTaskEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ReleaseTaskStatus, enumName: 'ReleaseTaskStatus' })
  status: ReleaseTaskStatus

  @ApiProperty({ type: SearchTaskReleaseEntity })
  release: SearchTaskReleaseEntity
}

export class ArtistSearchEntity {
  @ApiProperty({ type: [SearchReleaseEntity], maxItems: 5 })
  releases: SearchReleaseEntity[]

  @ApiProperty({ type: [SearchTrackEntity], maxItems: 5 })
  tracks: SearchTrackEntity[]

  @ApiProperty({ type: [SearchTaskEntity], maxItems: 5 })
  tasks: SearchTaskEntity[]
}
