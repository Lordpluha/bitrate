import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AiAllowanceEntity } from '../entities'

export function GetAiAllowanceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read the artist's AI allowance for this month" }),
    ApiResponse({ status: HttpStatus.OK, type: AiAllowanceEntity }),
  )
}
