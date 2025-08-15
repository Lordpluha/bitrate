import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function GetAlbumByIdSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Get album by id' }))
}
