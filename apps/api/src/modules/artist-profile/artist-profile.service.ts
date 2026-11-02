import { isPrismaP2002 } from '@common/utils/prisma'
import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  type PublicImageFolder,
  removePublicImage,
  storePublicImage,
} from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ARTIST_PROFILE_ERRORS } from './artist-profile.errors'
import {
  ArtistSocialsSchema,
  type ProfileImageVersionDto,
  type SetArtistLocaleDto,
  type UpdateArtistProfileDto,
} from './dtos/artist-profile.dto'

const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024

/** A profile edited between reading its version and writing the language is read once more. */
const LOCALE_WRITE_ATTEMPTS = 2

export type ProfileImageKind = 'avatar' | 'background'

const IMAGE_FOLDERS = {
  avatar: 'artists/avatars',
  background: 'artists/backgrounds',
} as const satisfies Record<ProfileImageKind, PublicImageFolder>

const PROFILE_SELECT = {
  id: true,
  username: true,
  email: true,
  bio: true,
  country: true,
  socials: true,
  avatar: true,
  backgroundImage: true,
  verified: true,
  twoFactorEnabled: true,
  emailVerifiedAt: true,
  locale: true,
  updatedAt: true,
} as const satisfies Prisma.ArtistSelect

type ProfileRecord = Prisma.ArtistGetPayload<{ select: typeof PROFILE_SELECT }>

/**
 * The signed-in artist's own profile and account summary for the workspace. Writes carry the
 * profile version so two tabs never silently overwrite each other; images go through the
 * storage service with content checks, never as client-supplied URLs.
 */
@Injectable()
export class ArtistProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async read(artistId: string) {
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      select: PROFILE_SELECT,
    })
    if (!artist) throw new NotFoundException(ARTIST_PROFILE_ERRORS.NOT_FOUND)
    return view(artist)
  }

  async update(artistId: string, input: UpdateArtistProfileDto) {
    const current = await this.read(artistId)
    const socials =
      input.socials === undefined ? undefined : mergeSocials(current.socials, input.socials)
    const updated = await this.versionedWrite(artistId, input.expectedUpdatedAt, {
      ...(input.username === undefined ? {} : { username: input.username }),
      ...(input.bio === undefined ? {} : { bio: input.bio }),
      ...(input.country === undefined ? {} : { country: input.country }),
      ...(socials === undefined ? {} : { socials }),
    })
    await this.invalidatePublicCaches()
    return updated
  }

  /**
   * Sets the workspace language. It is a preference, not profile content: no version is
   * required, and the stored version is written back unchanged so an open profile form never
   * conflicts with it. The write is conditional on that version, so it never rolls back an
   * edit that landed in between.
   */
  async setLocale(artistId: string, locale: SetArtistLocaleDto['locale']) {
    for (let attempt = 0; attempt < LOCALE_WRITE_ATTEMPTS; attempt++) {
      const { updatedAt } = await this.read(artistId)
      const [artist] = await this.prisma.artist.updateManyAndReturn({
        where: { id: artistId, deletedAt: null, updatedAt },
        data: { locale, updatedAt },
        select: PROFILE_SELECT,
      })
      if (artist) return view(artist)
    }
    throw new ConflictException(ARTIST_PROFILE_ERRORS.CHANGED)
  }

  async uploadImage(
    artistId: string,
    kind: ProfileImageKind,
    file: Express.Multer.File | undefined,
    input: ProfileImageVersionDto,
  ) {
    if (!file) throw new BadRequestException(ARTIST_PROFILE_ERRORS.IMAGE_REQUIRED)
    const folder = IMAGE_FOLDERS[kind]
    const previous = await this.currentImage(artistId, kind)
    const name = await storePublicImage(this.storage, folder, file, {
      maxBytes: MAX_PROFILE_IMAGE_BYTES,
    })
    const path = `/static/${folder}/${name}`
    let updated: ReturnType<typeof view>
    try {
      updated = await this.versionedWrite(
        artistId,
        input.expectedUpdatedAt,
        kind === 'avatar' ? { avatar: path } : { backgroundImage: path },
      )
    } catch (error) {
      await removePublicImage(this.storage, folder, name)
      throw error
    }
    await removePublicImage(this.storage, folder, ownedImageName(previous, folder))
    await this.invalidatePublicCaches()
    return updated
  }

  async removeImage(artistId: string, kind: ProfileImageKind, input: ProfileImageVersionDto) {
    const folder = IMAGE_FOLDERS[kind]
    const previous = await this.currentImage(artistId, kind)
    const updated = await this.versionedWrite(
      artistId,
      input.expectedUpdatedAt,
      kind === 'avatar' ? { avatar: null } : { backgroundImage: null },
    )
    await removePublicImage(this.storage, folder, ownedImageName(previous, folder))
    await this.invalidatePublicCaches()
    return updated
  }

  private async currentImage(artistId: string, kind: ProfileImageKind) {
    const profile = await this.read(artistId)
    return kind === 'avatar' ? profile.avatar : profile.backgroundImage
  }

  /** One predicate checks the version; a miss is 404 when the artist is gone, else 409. */
  private async versionedWrite(
    artistId: string,
    expectedUpdatedAt: string,
    data: Prisma.ArtistUpdateManyMutationInput,
  ) {
    const expected = new Date(expectedUpdatedAt)
    let rows: ProfileRecord[]
    try {
      rows = await this.prisma.artist.updateManyAndReturn({
        where: { id: artistId, deletedAt: null, updatedAt: expected },
        data: { ...data, updatedAt: new Date(Math.max(Date.now(), expected.getTime() + 1)) },
        select: PROFILE_SELECT,
      })
    } catch (error) {
      if (isPrismaP2002(error)) throw new ConflictException(ARTIST_PROFILE_ERRORS.USERNAME_TAKEN)
      throw error
    }
    const [artist] = rows
    if (artist) return view(artist)
    await this.read(artistId)
    throw new ConflictException(ARTIST_PROFILE_ERRORS.CHANGED)
  }

  private async invalidatePublicCaches() {
    await Promise.all([this.cache.invalidate(NS.ARTISTS), this.cache.invalidate(NS.SEARCH)])
  }
}

function view({ socials, emailVerifiedAt, ...artist }: ProfileRecord) {
  const parsed = ArtistSocialsSchema.safeParse(socials ?? {})
  return {
    ...artist,
    emailVerified: emailVerifiedAt !== null,
    socials: parsed.success ? compactSocials(parsed.data) : {},
  }
}

type Socials = Record<string, string>

/** Keeps only set links, so a cleared link disappears instead of being stored as null. */
function compactSocials(socials: Record<string, string | null | undefined>): Socials {
  return Object.fromEntries(
    Object.entries(socials).filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
}

function mergeSocials(
  current: Socials,
  changes: Record<string, string | null | undefined>,
): Prisma.InputJsonObject {
  return compactSocials({ ...current, ...changes })
}

/** The stored file name of an image this module uploaded; seeded or external images stay. */
function ownedImageName(path: string | null, folder: PublicImageFolder): string | null {
  const prefix = `/static/${folder}/`
  return path?.startsWith(prefix) ? path.slice(prefix.length) : null
}
