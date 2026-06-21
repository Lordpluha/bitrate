import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam } from '@nestjs/swagger'

/** Runs the update artist swagger operation. */
export function UpdateArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update artist profile' }),
    ApiParam({ name: 'id', description: 'Artist ID (UUID)', type: 'string', format: 'uuid' }),
  )
}
