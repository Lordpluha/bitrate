import { Prisma } from '@prisma/client'

export function isPrismaP2025(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}
