import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function UpdateAlbumByIdSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Update album by id' }))
}
