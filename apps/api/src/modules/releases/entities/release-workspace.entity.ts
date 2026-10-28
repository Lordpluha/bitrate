import { ApiProperty } from '@nestjs/swagger'
import {
  ArtistTrackStatus,
  ArtistTrackVersion,
  ReleaseCreditRole,
  ReleaseMasterOwner,
  ReleaseReviewDecision,
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

  @ApiProperty({ description: 'Whether a master audio file was uploaded for this draft' })
  hasAudio: boolean

  @ApiProperty({ type: String, nullable: true, description: 'Original name of the uploaded file' })
  audioFileName: string | null

  @ApiProperty({ type: Number, nullable: true, minimum: 0 })
  audioSizeBytes: number | null

  @ApiProperty({
    type: [Number],
    description:
      'Normalised peak levels (0–1) of the master for drawing its waveform; empty until computed',
  })
  waveform: number[]
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
      'COVER_MISSING',
      'TRACK_AUDIO_MISSING',
      'MASTER_OWNER_MISSING',
      'WRITERS_NOT_CONFIRMED',
      'CONTRIBUTOR_ROLES_MISSING',
      'SPLITS_INCOMPLETE',
    ],
    enumName: 'ReleaseBlockerCode',
  })
  code: string

  @ApiProperty({ format: 'uuid', required: false })
  contributorId?: string

  @ApiProperty({ format: 'uuid', required: false })
  trackId?: string

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
/** The most recent Bitrate review decision the artist sees in the workspace. */
export class WorkspaceReviewEntity {
  @ApiProperty({ enum: ReleaseReviewDecision, enumName: 'ReleaseReviewDecision' })
  decision: ReleaseReviewDecision

  @ApiProperty({ type: String, nullable: true })
  message: string | null

  @ApiProperty({ type: [String] })
  requiredChanges: string[]

  @ApiProperty({ type: [String] })
  recommendations: string[]

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date
}

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

  @ApiProperty({
    enum: ['ARTIST', 'ADMIN'],
    enumName: 'ReleaseUnpublishedBy',
    nullable: true,
    description:
      'Who took the release offline; only the artist can publish their own takedown again',
  })
  unpublishedBy: 'ARTIST' | 'ADMIN' | null

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'The player album created when the release first went live',
  })
  albumId: string | null

  @ApiProperty({ type: WorkspaceRightsEntity })
  rights: WorkspaceRightsEntity

  @ApiProperty({ type: [WorkspaceSplitEntity], maxItems: 100 })
  splits: WorkspaceSplitEntity[]

  @ApiProperty({ type: ReleaseReadinessEntity })
  readiness: ReleaseReadinessEntity

  @ApiProperty({ type: WorkspaceReviewEntity, nullable: true })
  latestReview: WorkspaceReviewEntity | null
}
