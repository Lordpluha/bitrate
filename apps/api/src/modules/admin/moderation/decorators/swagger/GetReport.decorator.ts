import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminModerationReportEntity } from '../../entities'

/** Runs the get report swagger operation. */
export function GetReportSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminModerationReportEntity),
    ApiOperation({ summary: 'Get a moderation report by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminModerationReportEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Report not found' }),
  )
}
