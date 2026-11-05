import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { ArtistWorkspacePage } from '@prisma/client'
import {
  type SaveWorkspaceLayoutDto,
  type WorkspaceLayoutPage,
  type WorkspaceTile,
  WorkspaceTilesSchema,
} from './dtos/workspace-layout.dto'

const PAGE_ENUM: Record<WorkspaceLayoutPage, ArtistWorkspacePage> = {
  dashboard: ArtistWorkspacePage.DASHBOARD,
  analytics: ArtistWorkspacePage.ANALYTICS,
  'release-draft': ArtistWorkspacePage.RELEASE_DRAFT,
}

export type WorkspaceLayout = {
  page: WorkspaceLayoutPage
  tiles: WorkspaceTile[]
  updatedAt: Date | null
}

/** Per-artist tile arrangements of workspace pages; each artist only reaches their own. */
@Injectable()
export class ArtistWorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async layout(artistId: string, page: WorkspaceLayoutPage): Promise<WorkspaceLayout> {
    const stored = await this.prisma.artistWorkspaceLayout.findUnique({
      where: { artistId_page: { artistId, page: PAGE_ENUM[page] } },
      select: { tiles: true, updatedAt: true },
    })
    if (!stored) return { page, tiles: [], updatedAt: null }
    // A layout that no longer matches the schema is treated as no layout, not as an error.
    const tiles = WorkspaceTilesSchema.safeParse(stored.tiles)
    return {
      page,
      tiles: tiles.success ? tiles.data : [],
      updatedAt: tiles.success ? stored.updatedAt : null,
    }
  }

  async saveLayout(
    artistId: string,
    page: WorkspaceLayoutPage,
    input: SaveWorkspaceLayoutDto,
  ): Promise<WorkspaceLayout> {
    const key = { artistId, page: PAGE_ENUM[page] }
    const saved = await this.prisma.artistWorkspaceLayout.upsert({
      where: { artistId_page: key },
      create: { ...key, tiles: input.tiles },
      update: { tiles: input.tiles },
      select: { updatedAt: true },
    })
    return { page, tiles: input.tiles, updatedAt: saved.updatedAt }
  }

  async resetLayout(artistId: string, page: WorkspaceLayoutPage): Promise<WorkspaceLayout> {
    await this.prisma.artistWorkspaceLayout.deleteMany({
      where: { artistId, page: PAGE_ENUM[page] },
    })
    return { page, tiles: [], updatedAt: null }
  }
}
