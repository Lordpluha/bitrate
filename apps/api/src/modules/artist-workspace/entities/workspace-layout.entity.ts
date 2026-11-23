import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  WORKSPACE_GRID_COLUMNS,
  WORKSPACE_GRID_MAX_ROW,
  WORKSPACE_LAYOUT_PAGES,
  workspaceTileSizes,
} from '../dtos/workspace-layout.dto'

export class WorkspaceTileEntity {
  @ApiProperty({ description: 'Tile identifier the web app defines for the page' })
  id: string

  @ApiProperty({ enum: workspaceTileSizes, enumName: 'WorkspaceTileSize' })
  size: string

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 12,
    description: 'Width in a 12-column grid; overrides the legacy size preset',
  })
  columns?: number

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 12,
    description: 'Height in grid rows; omitted means fit the content automatically',
  })
  rows?: number

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    maximum: WORKSPACE_GRID_COLUMNS - 1,
    description: 'Left column (0-based); x + columns never exceeds 12. Absent in older layouts',
  })
  x?: number

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    maximum: WORKSPACE_GRID_MAX_ROW,
    description: 'Top row (0-based). Absent in older layouts, which flow in display order',
  })
  y?: number

  @ApiProperty()
  hidden: boolean
}

export class WorkspaceLayoutEntity {
  @ApiProperty({ enum: Object.values(WORKSPACE_LAYOUT_PAGES), enumName: 'WorkspaceLayoutPage' })
  page: string

  @ApiProperty({
    type: [WorkspaceTileEntity],
    description: 'Display order; empty when the artist keeps the default layout',
  })
  tiles: WorkspaceTileEntity[]

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null
}
