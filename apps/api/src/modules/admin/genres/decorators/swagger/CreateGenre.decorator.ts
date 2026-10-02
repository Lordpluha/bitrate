import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { CreateGenreDto } from '../../dtos'
import { AdminGenreEntity } from '../../entities'

/** Runs the create genre swagger operation. */
export function CreateGenreSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminGenreEntity),
    ApiOperation({ summary: 'Create a genre; the slug is derived from the name when absent' }),
    // Explicit: the controller imports the DTO as a type, so reflection alone names this schema `Function`.
    ApiBody({ type: CreateGenreDto }),
    ApiResponse({ status: HttpStatus.CREATED, schema: { $ref: getSchemaPath(AdminGenreEntity) } }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid name, slug or colour' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Slug already in use' }),
  )
}
