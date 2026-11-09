import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ARTIST_WORKSPACE_VALIDATION } from '../artist-workspace.errors'

/** More tiles than any page has; keeps a stored layout small. */
const MAX_LAYOUT_TILES = 24

/** Workspace pages with an arrangeable layout, as they appear in the URL. */
export const WORKSPACE_LAYOUT_PAGES = {
  dashboard: 'dashboard',
  analytics: 'analytics',
  'release-draft': 'release-draft',
} as const

export type WorkspaceLayoutPage = keyof typeof WORKSPACE_LAYOUT_PAGES

export const workspaceTileSizes = ['S', 'M', 'L'] as const

const WorkspaceTileSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9-]{0,39}$/)
    .describe('Tile identifier the web app defines for the page'),
  size: z
    .enum(workspaceTileSizes)
    .describe('Legacy preset used when columns is absent; explicit columns takes precedence'),
  columns: z
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe('Width in a 12-column grid; omitted for legacy S/M/L layouts'),
  rows: z
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe('Height in grid rows; omitted means fit the content automatically'),
  hidden: z.boolean().describe('Hidden tiles stay in the layout so they can be shown again'),
})

export const WorkspaceTilesSchema = z
  .array(WorkspaceTileSchema)
  .max(MAX_LAYOUT_TILES)
  .refine(
    (tiles) => new Set(tiles.map((tile) => tile.id)).size === tiles.length,
    ARTIST_WORKSPACE_VALIDATION.DUPLICATE_TILES,
  )

export const SaveWorkspaceLayoutSchema = z.strictObject({
  tiles: WorkspaceTilesSchema.describe('Every tile of the page, in display order'),
})

export class SaveWorkspaceLayoutDto extends createZodDto(SaveWorkspaceLayoutSchema) {}

export type WorkspaceTile = z.infer<typeof WorkspaceTileSchema>
