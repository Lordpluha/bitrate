import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function GetTrackByIdSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Get track by id' }))
}
