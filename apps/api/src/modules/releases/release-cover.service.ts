import { PrismaService } from '@infra/prisma/prisma.service'
import {
  type PublicImageFolder,
  removePublicImage,
  storePublicImage,
} from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { ReleaseDraftVersionDto, UploadReleaseCoverDto } from './dtos/release-media.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'
import { MAX_RELEASE_COVER_BYTES } from './release-media.interceptors'

const COVER_FOLDER: PublicImageFolder = 'releases/covers'
const COVER_PATH_PREFIX = `/static/${COVER_FOLDER}/`

/** The release summary returned by {@link lockOwnedDraft}. */
type LockedDraft = Awaited<ReturnType<typeof lockOwnedDraft>>

/** A committed cover change: the cover it replaced and the locked release. */
type CoverSwap = { previous: string | null; release: LockedDraft }

/** The stored file name of a cover this module uploaded, or null for demo/external covers. */
function coverName(cover: string | null): string | null {
  return cover?.startsWith(COVER_PATH_PREFIX) ? cover.slice(COVER_PATH_PREFIX.length) : null
}

/**
 * Artwork of an owned draft release.
 *
 * The image is written to storage before the database transaction and removed again when it
 * fails, so a version conflict never leaves the release pointing at a missing object. The
 * replaced cover is deleted afterwards on a best-effort basis.
 */
@Injectable()
export class ReleaseCoverService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async uploadCover(
    ownerArtistId: string,
    id: string,
    file: Express.Multer.File | undefined,
    input: UploadReleaseCoverDto,
  ) {
    if (!file) throw new BadRequestException(RELEASE_ERRORS.COVER_FILE_REQUIRED)
    const name = await storePublicImage(this.storage, COVER_FOLDER, file, {
      maxBytes: MAX_RELEASE_COVER_BYTES,
    })
    const cover = `${COVER_PATH_PREFIX}${name}`
    let swap: CoverSwap
    try {
      swap = await this.swapCover(ownerArtistId, id, input.expectedUpdatedAt, cover)
    } catch (error) {
      await removePublicImage(this.storage, COVER_FOLDER, name)
      throw error
    }
    await removePublicImage(this.storage, COVER_FOLDER, coverName(swap.previous))
    return { release: swap.release, cover }
  }

  async removeCover(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto) {
    const { previous, release } = await this.swapCover(
      ownerArtistId,
      id,
      input.expectedUpdatedAt,
      null,
    )
    await removePublicImage(this.storage, COVER_FOLDER, coverName(previous))
    return { release, cover: null }
  }

  /** Sets the draft's cover under the draft lock, returning the one it replaced. */
  private swapCover(
    ownerArtistId: string,
    id: string,
    expectedUpdatedAt: string,
    cover: string | null,
  ): Promise<CoverSwap> {
    return this.prisma.$transaction(async (tx) => {
      const previous = await this.currentCover(tx, ownerArtistId, id)
      const release = await lockOwnedDraft(tx, ownerArtistId, id, expectedUpdatedAt, { cover })
      return { previous, release }
    })
  }

  private async currentCover(
    tx: Prisma.TransactionClient,
    ownerArtistId: string,
    id: string,
  ): Promise<string | null> {
    const release = await tx.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: { cover: true },
    })
    return release?.cover ?? null
  }
}
