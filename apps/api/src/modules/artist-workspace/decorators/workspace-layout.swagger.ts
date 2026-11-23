import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { SaveWorkspaceLayoutDto, WORKSPACE_LAYOUT_PAGES } from '../dtos/workspace-layout.dto'
import { WorkspaceLayoutEntity } from '../entities/workspace-layout.entity'

const PageParam = ApiParam({
  name: 'page',
  enum: Object.values(WORKSPACE_LAYOUT_PAGES),
  enumName: 'WorkspaceLayoutPage',
})

export function GetWorkspaceLayoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read the artist's tile layout for a workspace page" }),
    PageParam,
    ApiResponse({ status: HttpStatus.OK, type: WorkspaceLayoutEntity }),
  )
}

export function SaveWorkspaceLayoutSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Replace the artist's tile layout for a workspace page",
      description:
        'The list is the whole layout: width (1–12 columns), optional height (1–12 rows), optional grid position (x 0–11, y 0–199, with x + columns ≤ 12) and visibility of every tile. Layouts without positions remain valid and are read in display order; legacy S/M/L presets apply when columns is absent.',
    }),
    PageParam,
    ApiBody({ type: SaveWorkspaceLayoutDto }),
    ApiResponse({ status: HttpStatus.OK, type: WorkspaceLayoutEntity }),
  )
}

export function ResetWorkspaceLayoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Return a workspace page to its default tile layout' }),
    PageParam,
    ApiResponse({ status: HttpStatus.OK, type: WorkspaceLayoutEntity }),
  )
}
