import type { Prisma } from '@prisma/client'

export const DELIVERY_SELECT = {
  id: true,
  title: true,
  status: true,
  cover: true,
  updatedAt: true,
  destinations: { select: { destination: true } },
  territories: { select: { countryCode: true }, orderBy: { countryCode: 'asc' } },
  deliveries: {
    select: { destination: true, state: true, message: true, updatedAt: true },
  },
} as const satisfies Prisma.ReleaseSelect
