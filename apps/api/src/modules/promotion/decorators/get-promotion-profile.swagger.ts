import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PromotionProfileEntity } from '../entities'

export function GetPromotionProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read the artist's promotion profile" }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionProfileEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No profile yet' }),
  )
}
