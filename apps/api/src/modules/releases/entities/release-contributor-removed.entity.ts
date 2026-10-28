import { ApiProperty } from '@nestjs/swagger'
import { ReleaseEntity } from './release.entity'

export class ReleaseContributorRemovedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ format: 'uuid' })
  contributorId: string
}
