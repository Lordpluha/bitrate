import {
  ReleaseBlockerEntity,
  ReleaseNoticeEntity,
} from '@modules/releases/entities/release-workspace.entity'
import { ApiProperty } from '@nestjs/swagger'
import {
  AlbumType,
  DeliveryDestination,
  ReleaseCreditRole,
  ReleaseMasterOwner,
  ReleaseReviewDecision,
  ReleaseRightType,
  ReleaseStatus,
} from '@prisma/client'

export class AdminReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: AlbumType, enumName: 'AlbumType' })
  type: AlbumType

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  submittedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date

  @ApiProperty({ format: 'uuid' })
  artistId: string

  @ApiProperty()
  artistUsername: string

  @ApiProperty({ minimum: 0 })
  trackCount: number
}

export class PaginatedAdminReleasesEntity {
  @ApiProperty({ type: [AdminReleaseEntity] })
  data: AdminReleaseEntity[]

  @ApiProperty({ minimum: 0 })
  total: number

  @ApiProperty({ minimum: 1 })
  page: number

  @ApiProperty({ minimum: 1 })
  limit: number
}

export class AdminReleaseReviewEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

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

  @ApiProperty({ type: String, nullable: true })
  reviewerUsername: string | null
}

export class AdminReleaseTrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ type: Number, nullable: true })
  duration: number | null

  @ApiProperty({ type: String, nullable: true })
  isrc: string | null

  @ApiProperty({ type: String, nullable: true })
  audioFileName: string | null

  @ApiProperty()
  hasAudio: boolean
}

export class AdminReleaseContributorEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  displayName: string

  @ApiProperty({ enum: ReleaseCreditRole, enumName: 'ReleaseCreditRole', isArray: true })
  roles: ReleaseCreditRole[]
}

export class AdminReleaseSplitEntity {
  @ApiProperty({ format: 'uuid' })
  contributorId: string

  @ApiProperty({ enum: ReleaseRightType, enumName: 'ReleaseRightType' })
  rightType: ReleaseRightType

  @ApiProperty({ minimum: 1, maximum: 10_000 })
  shareBasisPoints: number
}

export class AdminReleaseRightsEntity {
  @ApiProperty({ enum: ReleaseMasterOwner, enumName: 'ReleaseMasterOwner', nullable: true })
  masterOwnerType: ReleaseMasterOwner | null

  @ApiProperty({ type: String, nullable: true })
  masterOwnerName: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  writersConfirmedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  accuracyConfirmedAt: Date | null
}

export class AdminReleaseReadinessEntity {
  @ApiProperty({ type: [ReleaseBlockerEntity] })
  blockers: ReleaseBlockerEntity[]

  @ApiProperty({ type: [ReleaseNoticeEntity] })
  notices: ReleaseNoticeEntity[]
}

export class AdminReleaseDetailEntity extends AdminReleaseEntity {
  @ApiProperty({ type: String, nullable: true })
  upc: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  scheduledAt: Date | null

  @ApiProperty({ type: AdminReleaseRightsEntity })
  rights: AdminReleaseRightsEntity

  @ApiProperty({ type: [AdminReleaseTrackEntity] })
  tracks: AdminReleaseTrackEntity[]

  @ApiProperty({ type: [AdminReleaseContributorEntity] })
  contributors: AdminReleaseContributorEntity[]

  @ApiProperty({ type: [AdminReleaseSplitEntity] })
  splits: AdminReleaseSplitEntity[]

  @ApiProperty({ type: [String], description: 'Empty means worldwide' })
  territories: string[]

  @ApiProperty({ enum: DeliveryDestination, enumName: 'DeliveryDestination', isArray: true })
  destinations: DeliveryDestination[]

  @ApiProperty({ type: AdminReleaseReadinessEntity })
  readiness: AdminReleaseReadinessEntity

  @ApiProperty({ type: [AdminReleaseReviewEntity], description: 'Newest first' })
  reviews: AdminReleaseReviewEntity[]
}

export class AdminReleaseDecisionReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date
}

export class AdminReleaseDecisionEntity {
  @ApiProperty({ type: AdminReleaseDecisionReleaseEntity })
  release: AdminReleaseDecisionReleaseEntity

  @ApiProperty({ type: AdminReleaseReviewEntity })
  review: AdminReleaseReviewEntity
}
