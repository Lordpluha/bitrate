import { isLegalAcceptanceCurrent, LEGAL_VERSION } from '@common/legal'
import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  type PublicImageFolder,
  removePublicImage,
  storePublicImage,
} from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { Inject, Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { UserEntity } from './entities'
import { PUBLIC_USER_SELECT, SELF_USER_SELECT } from './users.select'

/** Largest avatar accepted, in bytes. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

/** Where avatars live in storage; the first part of their public `/static/...` URL. */
const AVATAR_FOLDER = 'users/avatars' satisfies PublicImageFolder

/** The URL prefix of avatars this service stored; anything else is not ours to delete. */
const AVATAR_PATH_PREFIX = `/static/${AVATAR_FOLDER}/`

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /**
   * Runs the find by id operation. Filters `deletedAt` — a soft-deleted account's public
   * profile is not reachable, mirroring `ArtistsService.findById`.
   */
  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
  }

  /**
   * The signed-in account's own record.
   *
   * Separate from `findById` because settings need the address and two-factor
   * state that the public projection deliberately withholds.
   */
  async findSelfById(id: UserEntity['id']) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: SELF_USER_SELECT,
    })
    return { ...user, legalAcceptanceRequired: !isLegalAcceptanceCurrent(user.legalVersion) }
  }

  /**
   * Records that the account accepted the current legal documents, then returns its own record.
   * Accounts created before acceptance was tracked, or before a new revision, are asked once.
   */
  async acceptLegal(id: UserEntity['id']) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { legalVersion: LEGAL_VERSION, legalAcceptedAt: new Date() },
      select: SELF_USER_SELECT,
    })
    return { ...user, legalAcceptanceRequired: !isLegalAcceptanceCurrent(user.legalVersion) }
  }

  /** Runs the get by email operation. Filters `deletedAt` — see `findById`. */
  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    })
  }

  /** Runs the get by username operation. Filters `deletedAt` — see `findById`. */
  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
  }

  async findAll({
    username,
    limit = 10,
    page = 1,
  }: {
    username: UserEntity['username']
    limit?: number
    page?: number
  }) {
    const pagination = normalizePagination(page, limit)
    const where = {
      username: { contains: username, mode: 'insensitive' as const },
      deletedAt: null,
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: PUBLIC_USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ])
    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  async create(data: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({
      data,
      select: { id: true, email: true, username: true },
    })
  }

  async updateById(id: UserEntity['id'], userData: Partial<Omit<UserEntity, 'id' | ''>>) {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
      select: PUBLIC_USER_SELECT,
    })
  }

  /**
   * Stores a new avatar and points the user at it. The stored object is removed again when the
   * save fails, and the previous avatar is removed best-effort once the new one is saved.
   */
  async uploadAvatar(userId: UserEntity['id'], file: Express.Multer.File) {
    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    })
    const name = await storePublicImage(this.storage, AVATAR_FOLDER, file, {
      maxBytes: MAX_AVATAR_BYTES,
    })
    let updated: Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }>
    try {
      updated = await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: `${AVATAR_PATH_PREFIX}${name}` },
        select: PUBLIC_USER_SELECT,
      })
    } catch (error) {
      await removePublicImage(this.storage, AVATAR_FOLDER, name)
      throw error
    }
    const previousName = previous?.avatar?.startsWith(AVATAR_PATH_PREFIX)
      ? previous.avatar.slice(AVATAR_PATH_PREFIX.length)
      : null
    await removePublicImage(this.storage, AVATAR_FOLDER, previousName)
    return updated
  }
}
