import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { GenreOptionEntity } from '../entities/genre-option.entity'

export function ListArtistGenresSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the genres artists can tag recordings with',
      description: 'The whole admin-managed catalogue, sorted by name.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: [GenreOptionEntity] }),
  )
}
