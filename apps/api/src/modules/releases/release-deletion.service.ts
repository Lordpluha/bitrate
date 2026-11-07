import { PrismaService } from '@infra/prisma/prisma.service'
import { AlbumsService } from '@modules/albums/albums.service'
import { ReleaseTrackDeletionService } from '@modules/tracks/release-track-deletion.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { ReleaseDraftVersionDto } from './dtos/release-media.dto'
import { RELEASE_ERRORS } from './errors'

/** Removes an owned release and unshared catalogue copies; private source files stay. */
@Injectable()
export class ReleaseDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tracks: ReleaseTrackDeletionService,
    private readonly albums: AlbumsService,
  ) {}

  async remove(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const deletedAt = new Date()
      const claimed = await tx.release.updateMany({
        where: { id, ownerArtistId, deletedAt: null, updatedAt: new Date(input.expectedUpdatedAt) },
        data: { deletedAt, upc: null },
      })
      if (claimed.count !== 1) {
        const visible = await tx.release.findFirst({
          where: { id, ownerArtistId, deletedAt: null },
          select: { id: true },
        })
        if (!visible) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
        throw new ConflictException(RELEASE_ERRORS.CHANGED)
      }
      // The release lock serializes deletion with review, publishing and recording writes.
      const release = await tx.release.findUniqueOrThrow({
        where: { id },
        select: { albumId: true, tracks: { select: { trackId: true } } },
      })
      await tx.artistTrackDraft.updateMany({
        where: { releaseId: id, ownerArtistId, deletedAt: null },
        data: { deletedAt, isrc: null },
      })
      const trackIds = release.tracks.map(({ trackId }) => trackId)
      if (trackIds.length) await this.tracks.remove(tx, trackIds, deletedAt)
      if (release.albumId) await this.albums.deleteReleaseAlbum(tx, release.albumId, deletedAt)
    })
    await Promise.all([this.tracks.invalidateCaches(), this.albums.invalidateCatalogueCaches()])
  }
}
