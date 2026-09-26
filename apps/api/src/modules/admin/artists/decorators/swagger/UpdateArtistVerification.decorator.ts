import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { UpdateArtistVerificationDto } from '../../dtos'
import { AdminArtistEntity } from '../../entities'

/** Runs the update artist verification swagger operation. */
export function UpdateArtistVerificationSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminArtistEntity),
    ApiOperation({ summary: "Set an artist's verification status" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: UpdateArtistVerificationDto }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminArtistEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Requires the ADMIN role' }),
  )
}
