import { ApiProperty } from '@nestjs/swagger'
import { PROMOTION_CHANNELS, PROMOTION_GOALS } from '../dtos'

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
