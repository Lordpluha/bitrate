import { ApiProperty } from '@nestjs/swagger'
import { PromotionStepEntity } from './promotion-step.entity'

export class PromotionPlanEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  version: number

  @ApiProperty({ enum: ['GENERATING', 'READY', 'FAILED'], enumName: 'PromotionPlanStatus' })
  status: string

  @ApiProperty({ type: String, nullable: true, description: 'Message key when FAILED' })
  failure: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  releaseDate: Date | null

  @ApiProperty({ type: PromotionStepEntity, isArray: true })
  steps: PromotionStepEntity[]

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date
}
