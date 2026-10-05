import { ApiProperty } from '@nestjs/swagger'
import { ArtistTrackStatus, ArtistTrackVersion, ReleaseCreditRole } from '@prisma/client'
import { MusicReleaseEntity } from './music-catalogue.entity'

export class WorkspaceTrackDraftEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ArtistTrackVersion, enumName: 'ArtistTrackVersion' })
  version: ArtistTrackVersion

  @ApiProperty({ enum: ArtistTrackStatus, enumName: 'ArtistTrackStatus' })
  status: ArtistTrackStatus

  @ApiProperty({ type: Number, nullable: true, minimum: 0 })
  duration: number | null

  @ApiProperty()
  isDemo: boolean
}

export class WorkspaceTrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ type: Number, nullable: true, minimum: 0 })
  duration: number | null

  @ApiProperty({ minimum: 1 })
  position: number
}

export class WorkspaceParticipantEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  displayName: string

  @ApiProperty({ enum: ReleaseCreditRole, enumName: 'ReleaseCreditRole', isArray: true })
  roles: ReleaseCreditRole[]
}

/** Bounded metadata only: no audio URLs, login credentials or implied delivery results. */
export class ReleaseWorkspaceEntity extends MusicReleaseEntity {
  @ApiProperty({ type: [WorkspaceTrackDraftEntity], maxItems: 50 })
  trackDrafts: WorkspaceTrackDraftEntity[]

  @ApiProperty({ type: [WorkspaceTrackEntity], maxItems: 50 })
  tracks: WorkspaceTrackEntity[]

  @ApiProperty({ type: [WorkspaceParticipantEntity], maxItems: 50 })
  participants: WorkspaceParticipantEntity[]

  @ApiProperty({ minimum: 0 })
  participantCount: number
}
