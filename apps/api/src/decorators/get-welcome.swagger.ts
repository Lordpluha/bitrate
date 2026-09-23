import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Root endpoint — a plain-text welcome banner naming the running package. */
export function GetWelcomeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Welcome banner' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A plain-text welcome string',
      type: String,
    }),
  )
}
