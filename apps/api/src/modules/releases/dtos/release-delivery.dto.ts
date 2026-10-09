import { paginationQuerySchema } from '@common/pagination'
import { DeliveryDestination } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RELEASE_VALIDATION } from '../errors'

/** ISO 3166-1 alpha-2 shape; the list of real codes is the client's concern. */
const countryCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, RELEASE_VALIDATION.COUNTRY_CODE_INVALID)

const territories = z.discriminatedUnion('mode', [
  z.strictObject({ mode: z.literal('WORLDWIDE') }),
  z.strictObject({
    mode: z.literal('SELECTED'),
    countries: z
      .array(countryCode)
      .min(1)
      .max(250)
      .refine((codes) => new Set(codes).size === codes.length, RELEASE_VALIDATION.DUPLICATE_ITEMS),
  }),
])

export const UpdateDeliveryPlanSchema = z.strictObject({
  destinations: z
    .array(z.enum(DeliveryDestination))
    .max(Object.keys(DeliveryDestination).length)
    .refine((items) => new Set(items).size === items.length, RELEASE_VALIDATION.DUPLICATE_ITEMS)
    .describe('Stores to deliver to; empty keeps the release unplanned'),
  territories: territories.describe('Worldwide, or only the selected countries'),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export const ListDistributionSchema = paginationQuerySchema.strict()

export class UpdateDeliveryPlanDto extends createZodDto(UpdateDeliveryPlanSchema) {}
export class ListDistributionDto extends createZodDto(ListDistributionSchema) {}
