import { ApiProperty } from '@nestjs/swagger'
import { PROMOTION_CHANNELS, PROMOTION_GOALS } from '../dtos/promotion.dto'

export class PromotionProfileEntity {
  @ApiProperty({ enum: PROMOTION_GOALS, enumName: 'PromotionGoal' })
  goal: string

  @ApiProperty({ enum: PROMOTION_CHANNELS, enumName: 'PromotionChannel', isArray: true })
  channels: string[]

  @ApiProperty({ minimum: 1, maximum: 40 })
  weeklyHours: number

  @ApiProperty({ type: String, isArray: true, description: 'ISO 3166-1 alpha-2 codes' })
  countries: string[]

  @ApiProperty({ type: String, nullable: true })
  audience: string | null

  @ApiProperty({ type: String, isArray: true })
  voiceWords: string[]

  @ApiProperty({ type: String, isArray: true })
  voiceExamples: string[]

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date
}

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
}

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

export class AiAllowanceEntity {
  @ApiProperty({ description: 'Spent this month, in micro-dollars (US$ 1 = 1,000,000)' })
  usedMicroUsd: number

  @ApiProperty({ description: 'Monthly ceiling, in micro-dollars' })
  limitMicroUsd: number

  @ApiProperty({ type: String, format: 'date-time' })
  resetsAt: Date
}
