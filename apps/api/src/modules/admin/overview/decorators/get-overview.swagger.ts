import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminOverviewEntity } from '../entities'

/**
 * Runs the get overview swagger operation. Declares no 403 response — `@RequirePermission`
 * already declares it, and a method-level `ApiResponse` for the same status would replace that
 * one rather than merge with it (see `RequirePermission`'s own TSDoc).
 */
export function GetOverviewSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminOverviewEntity),
    ApiOperation({ summary: 'Get the operator landing dashboard summary' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminOverviewEntity) } }),
  )
}
