import { ApiProperty } from '@nestjs/swagger'
import { PROMOTION_CHANNELS } from '../dtos'
import { PromotionTranslationEntity } from './promotion-translation.entity'

export class PromotionPostEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ enum: PROMOTION_CHANNELS, enumName: 'PromotionChannel' })
  channel: string

  @ApiProperty({ description: 'The English master' })
  text: string

  @ApiProperty({ type: String, isArray: true })
  hashtags: string[]

  @ApiProperty({ description: 'False once the artist edited the master' })
  aiGenerated: boolean

  @ApiProperty({ description: 'Grows with every change of the master' })
  revision: number

  @ApiProperty({ description: "The channel's length limit for `text`" })
  maxLength: number

  @ApiProperty({ type: PromotionTranslationEntity, isArray: true })
  translations: PromotionTranslationEntity[]
}
