import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function CreateAlbumSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Create a new album' }))
}
