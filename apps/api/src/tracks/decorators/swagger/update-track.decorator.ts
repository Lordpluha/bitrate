import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function UpdateTrackByIdSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Update track by id' }))
}
