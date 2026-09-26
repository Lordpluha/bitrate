import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminModerationReportDetailEntity } from '../../entities'

/** Runs the get report swagger operation. */
export function GetReportSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminModerationReportDetailEntity),
    ApiOperation({
      summary: 'Get a moderation report by id, with its resolved subject and sibling reports',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminModerationReportDetailEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Report not found' }),
  )
}
