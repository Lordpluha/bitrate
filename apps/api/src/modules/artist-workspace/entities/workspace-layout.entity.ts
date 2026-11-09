import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { WORKSPACE_LAYOUT_PAGES, workspaceTileSizes } from '../dtos/workspace-layout.dto'

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
