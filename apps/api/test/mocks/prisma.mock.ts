import { PrismaService } from '@infra/prisma/prisma.service'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

export type PrismaMock = DeepMockProxy<PrismaService>

export const prismaMock: PrismaMock = mockDeep<PrismaService>()

export const resetPrismaMock = () => {
  mockReset(prismaMock)
}
