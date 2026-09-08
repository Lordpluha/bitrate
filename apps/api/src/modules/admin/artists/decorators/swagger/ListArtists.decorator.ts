import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { PaginatedAdminArtistsEntity } from '../../entities'

/** Runs the list artists swagger operation. */
export function ListArtistsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminArtistsEntity),
    ApiOperation({ summary: 'List artists' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'verified', required: false, type: Boolean }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search username/email' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of artists',
      schema: { $ref: getSchemaPath(PaginatedAdminArtistsEntity) },
    }),
  )
}
