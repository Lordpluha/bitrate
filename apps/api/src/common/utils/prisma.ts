import { Prisma } from '@prisma/client'

/** Returns true when `error` is Prisma's "record not found" error. */
export function isPrismaP2025(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

/** Returns true when `error` is Prisma's unique-constraint-violation error. */
export function isPrismaP2002(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}
