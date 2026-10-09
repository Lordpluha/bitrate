import { ApiProperty } from '@nestjs/swagger'
import { ReleaseEntity } from './release.entity'
import { WorkspaceTrackDraftEntity } from './release-workspace.entity'

export class ReleaseCoverUpdatedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({
    type: String,
    nullable: true,
    example: '/static/releases/covers/0192f1c4-7d2b-7c11-9f3e-1a2b3c4d5e6f.jpg',
    description: 'Public image path served outside the /api prefix; null after removal',
  })
  cover: string | null
}

export class ReleaseTrackUploadedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ type: WorkspaceTrackDraftEntity })
  track: WorkspaceTrackDraftEntity
}

export class ReleaseTrackRemovedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ format: 'uuid' })
  trackId: string
}
