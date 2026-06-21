import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam } from '@nestjs/swagger'

/** Runs the delete artist swagger operation. */
export function DeleteArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete artist profile' }),
    ApiParam({ name: 'id', description: 'Artist ID (UUID)', type: 'string', format: 'uuid' }),
  )
}
