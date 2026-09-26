import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { UpdateReportDto } from '../../dtos'
import { AdminModerationReportEntity } from '../../entities'

/** Runs the update report swagger operation. */
export function UpdateReportSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminModerationReportEntity),
    ApiOperation({ summary: 'Update a moderation report status' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: UpdateReportDto }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminModerationReportEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Report not found' }),
  )
}
