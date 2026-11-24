import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PromotionProfileDto } from '../dtos'
import { PromotionProfileEntity } from '../entities'

export function SavePromotionProfileSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Replace the artist's promotion profile",
      description:
        'Goal, channels, weekly time, audience and voice that every plan generation reads. Audience and example posts may not contain links, emails, phone numbers or @handles.',
    }),
    ApiBody({ type: PromotionProfileDto }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionProfileEntity }),
  )
}
