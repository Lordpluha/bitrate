import type { PrismaService } from '@infra/prisma/prisma.service'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

/** Defines the prisma mock. */
export type PrismaMock = DeepMockProxy<PrismaService>

/** The prisma mock value. */
export const prismaMock: PrismaMock = mockDeep<PrismaService>()

/** The reset prisma mock value. */
export const resetPrismaMock = () => {
  mockReset(prismaMock)
}
