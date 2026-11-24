import { ApiProperty } from '@nestjs/swagger'
import { PROMOTION_CHANNELS } from '../dtos'

/** One dated step on the Promotion page calendar. */
export class PromotionCalendarEntryEntity {
  @ApiProperty({ format: 'uuid' })
  stepId: string

  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty()
  releaseTitle: string

  @ApiProperty({ type: String, nullable: true, description: 'Stored cover, as on the dashboard' })
  cover: string | null

  @ApiProperty({ type: String, format: 'date-time' })
  dueAt: Date

  @ApiProperty({ minimum: -28, maximum: 28 })
  offsetDays: number

  @ApiProperty({ enum: ['PRE', 'LAUNCH', 'POST'], enumName: 'PromotionStepPhase' })
  phase: string

  @ApiProperty({
    enum: ['POST', 'FOLLOWER_MESSAGE', 'COUNTDOWN', 'ACTION'],
    enumName: 'PromotionStepKind',
  })
  kind: string

  @ApiProperty({ enum: PROMOTION_CHANNELS, enumName: 'PromotionChannel', isArray: true })
  channels: string[]

  @ApiProperty()
  title: string

  @ApiProperty({
    enum: ['SUGGESTED', 'APPROVED', 'EDITED', 'REJECTED', 'DONE'],
    enumName: 'PromotionStepState',
  })
  state: string

  @ApiProperty()
  aiGenerated: boolean
}
