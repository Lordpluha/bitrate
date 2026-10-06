import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminPodcastDetailEntity } from '../../entities'

/** Runs the get podcast swagger operation. */
export function GetPodcastSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPodcastDetailEntity),
    ApiOperation({
      summary: 'Get a podcast by id, including its episodes',
      description:
        'A taken-down podcast stays reachable by id, and every episode is listed with its own take-down state.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminPodcastDetailEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Podcast not found' }),
  )
}
