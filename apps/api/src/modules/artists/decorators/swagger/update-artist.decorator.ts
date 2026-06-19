import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam } from '@nestjs/swagger'

export function UpdateArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update artist profile' }),
    ApiParam({ name: 'id', description: 'Artist ID (UUID)', type: 'string', format: 'uuid' }),
  )
}
