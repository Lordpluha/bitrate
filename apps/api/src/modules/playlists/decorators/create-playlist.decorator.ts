import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function CreatePlaylistSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Create a new playlist' }))
}
