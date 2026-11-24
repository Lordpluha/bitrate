import { ApiProperty } from '@nestjs/swagger'

export class PromotionTranslationEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ enum: ['uk', 'pl'], enumName: 'TranslationLanguage' })
  language: string

  @ApiProperty({ description: 'Empty while the first translation is being made' })
  text: string

  @ApiProperty({
    enum: ['TRANSLATING', 'MACHINE', 'EDITED', 'STALE', 'FAILED'],
    enumName: 'PromotionTranslationState',
    description: 'MACHINE is labelled "Machine translation: please review"',
  })
  state: string

  @ApiProperty({ description: 'False once the artist edited the text' })
  aiGenerated: boolean

  @ApiProperty({
    type: Number,
    nullable: true,
    enum: [1, -1],
    description: '1 good, -1 needs work',
  })
  rating: number | null
}
