import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function UpdatePlaylistSwagger() {
  return applyDecorators(ApiOperation({ summary: 'Update playlist by id' }))
}
