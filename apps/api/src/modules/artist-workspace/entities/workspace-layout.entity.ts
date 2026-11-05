import { ApiProperty } from '@nestjs/swagger'
import { WORKSPACE_LAYOUT_PAGES, workspaceTileSizes } from '../dtos/workspace-layout.dto'

export class WorkspaceTileEntity {
  @ApiProperty({ description: 'Tile identifier the web app defines for the page' })
  id: string

  @ApiProperty({ enum: workspaceTileSizes, enumName: 'WorkspaceTileSize' })
  size: string

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
