import { ApiProperty } from '@nestjs/swagger'
import {
  ArtistTrackStatus,
  ArtistTrackVersion,
  ReleaseCreditRole,
  ReleaseMasterOwner,
  ReleaseRightType,
} from '@prisma/client'
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

  @ApiProperty({ type: String, nullable: true, example: 'USRC17607839' })
  isrc: string | null
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

  @ApiProperty({ type: String, nullable: true })
  isrc: string | null
}

export class WorkspaceParticipantEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  displayName: string

  @ApiProperty({ enum: ReleaseCreditRole, enumName: 'ReleaseCreditRole', isArray: true })
  roles: ReleaseCreditRole[]
}

export class WorkspaceRightsEntity {
  @ApiProperty({ enum: ReleaseMasterOwner, enumName: 'ReleaseMasterOwner', nullable: true })
  masterOwnerType: ReleaseMasterOwner | null

  @ApiProperty({ type: String, nullable: true, description: 'Set only for OTHER' })
  masterOwnerName: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  writersConfirmedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  accuracyConfirmedAt: Date | null
}

export class WorkspaceSplitEntity {
  @ApiProperty({ format: 'uuid' })
  contributorId: string

  @ApiProperty({ enum: ReleaseRightType, enumName: 'ReleaseRightType' })
  rightType: ReleaseRightType

  @ApiProperty({ minimum: 1, maximum: 10_000 })
  shareBasisPoints: number
}

export class ReleaseBlockerEntity {
  @ApiProperty({
    enum: [
      'NO_TRACKS',
      'MASTER_OWNER_MISSING',
      'WRITERS_NOT_CONFIRMED',
      'ACCURACY_NOT_CONFIRMED',
      'CONTRIBUTOR_ROLES_MISSING',
      'SPLITS_INCOMPLETE',
    ],
    enumName: 'ReleaseBlockerCode',
  })
  code: string

  @ApiProperty({ format: 'uuid', required: false })
  contributorId?: string

  @ApiProperty({ enum: ReleaseRightType, enumName: 'ReleaseRightType', required: false })
  rightType?: ReleaseRightType

  @ApiProperty({ required: false, minimum: 0 })
  totalBasisPoints?: number
}

export class ReleaseNoticeEntity {
  @ApiProperty({ enum: ['UPC_MISSING', 'ISRC_MISSING'], enumName: 'ReleaseNoticeCode' })
  code: string

  @ApiProperty({ format: 'uuid', required: false })
  trackId?: string
}

export class ReleaseReadinessEntity {
  @ApiProperty({ type: [ReleaseBlockerEntity], description: 'Each blocks submission' })
  blockers: ReleaseBlockerEntity[]

  @ApiProperty({ type: [ReleaseNoticeEntity], description: 'Informational; never blocks' })
  notices: ReleaseNoticeEntity[]
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

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  submittedAt: Date | null

  @ApiProperty({ type: WorkspaceRightsEntity })
  rights: WorkspaceRightsEntity

  @ApiProperty({ type: [WorkspaceSplitEntity], maxItems: 100 })
  splits: WorkspaceSplitEntity[]

  @ApiProperty({ type: ReleaseReadinessEntity })
  readiness: ReleaseReadinessEntity
}
