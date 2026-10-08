import { ApiProperty } from '@nestjs/swagger'
import { ReleaseEntity } from './release.entity'
import { WorkspaceParticipantEntity } from './release-workspace.entity'

export class ReleaseContributorEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ type: WorkspaceParticipantEntity })
  participant: WorkspaceParticipantEntity
}
