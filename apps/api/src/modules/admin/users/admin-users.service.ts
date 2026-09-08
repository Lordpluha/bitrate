import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { UserNotFoundException } from './errors'
import { ADMIN_USER_SAFE_SELECT } from './user.select'

/** Input for listing operator-facing users. */
type ListUsersInput = { page?: number; limit?: number; q?: string }

/** Handles the operator-facing user directory. */
@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ q }: Omit<ListUsersInput, 'page' | 'limit'>) {
    return {
      deletedAt: null,
      ...(q && {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    } satisfies Prisma.UserWhereInput
  }

  /** Runs the find all operation, paginated and optionally filtered. */
  async findAll({ page = 1, limit = 20, q }: ListUsersInput) {
    const where = this.buildWhere({ q })
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: ADMIN_USER_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.user.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** Runs the find by id operation. Excludes soft-deleted users. */
  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: ADMIN_USER_SAFE_SELECT,
    })
    if (!user) throw new UserNotFoundException(id)
    return user
  }

  /** Soft-deletes a user by stamping `deletedAt` — never a physical delete. */
  async softDelete(id: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } })
    if (!existing) throw new UserNotFoundException(id)

    return await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: ADMIN_USER_SAFE_SELECT,
    })
  }
}
