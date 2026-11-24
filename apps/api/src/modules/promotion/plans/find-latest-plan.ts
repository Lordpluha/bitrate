import type { PrismaService } from '@infra/prisma/prisma.service'

/** The newest plan version of a release, or null before the first generation. */
export function findLatestPlan(prisma: PrismaService, releaseId: string) {
  return prisma.promotionPlan.findFirst({
    where: { releaseId },
    orderBy: { version: 'desc' },
    select: { id: true, version: true, status: true },
  })
}
