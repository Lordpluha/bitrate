import { ApiProperty } from '@nestjs/swagger'
import { PromotionPostEntity } from './promotion-post.entity'

export class StepPostsEntity {
  @ApiProperty({ format: 'uuid' })
  stepId: string

  @ApiProperty({
    type: String,
    nullable: true,
    enum: ['GENERATING', 'READY', 'FAILED'],
    enumName: 'PromotionGenerationStatus',
    description: 'Null until drafts are requested',
  })
  status: string | null

  @ApiProperty({ type: String, nullable: true, description: 'Message key when FAILED' })
  failure: string | null

  @ApiProperty({ type: PromotionPostEntity, isArray: true })
  posts: PromotionPostEntity[]
}
