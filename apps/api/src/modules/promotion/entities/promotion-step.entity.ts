import { ApiProperty } from '@nestjs/swagger'
import { PROMOTION_CHANNELS } from '../dtos'

export class PromotionStepEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  position: number

  @ApiProperty({ minimum: -28, maximum: 28, description: 'Days from the release date' })
  offsetDays: number

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Release date plus the offset; moves with the release, null without a date',
  })
  dueAt: Date | null

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

  @ApiProperty()
  body: string

  @ApiProperty({
    enum: ['SUGGESTED', 'APPROVED', 'EDITED', 'REJECTED', 'DONE'],
    enumName: 'PromotionStepState',
  })
  state: string

  @ApiProperty({ description: 'False once the artist edited the text' })
  aiGenerated: boolean

  @ApiProperty({ description: 'A new suggestion for this step is being written' })
  regenerating: boolean

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Message key of the last failed regeneration; the old text was kept',
  })
  regenerationFailure: string | null
}
