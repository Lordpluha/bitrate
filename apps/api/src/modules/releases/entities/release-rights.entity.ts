import { ApiProperty } from '@nestjs/swagger'
import { ReleaseRightType } from '@prisma/client'
import { ReleaseEntity } from './release.entity'

export class ReleaseShareEntity {
  @ApiProperty({ format: 'uuid' })
  contributorId: string

  @ApiProperty({ minimum: 1, maximum: 10_000, description: '10,000 basis points is 100%' })
  shareBasisPoints: number
}

export class ReleaseSplitsEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ enum: ReleaseRightType, enumName: 'ReleaseRightType' })
  rightType: ReleaseRightType

  @ApiProperty({ type: [ReleaseShareEntity], maxItems: 50 })
  shares: ReleaseShareEntity[]
}

export class ReleaseTrackIdentifierEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ type: String, nullable: true, example: 'USRC17607839' })
  isrc: string | null
}

export class ReleaseTrackUpdatedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ type: ReleaseTrackIdentifierEntity })
  track: ReleaseTrackIdentifierEntity
}
