import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdateArtistDto } from '../../dtos'
import { SafeArtistEntity } from '../../entities'

/** Runs the update artist swagger operation. */
export function UpdateArtistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update artist profile' }),
    ApiParam({ name: 'id', description: 'Artist ID (UUID)', type: 'string', format: 'uuid' }),
    ApiBody({ type: UpdateArtistDto }),
    ApiResponse({ status: 200, type: SafeArtistEntity }),
  )
}
