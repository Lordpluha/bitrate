import { AlbumType } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { normalizeUpc } from '../release-identifiers'
import { CreateReleaseSchema } from './create-release.dto'

const UpcSchema = z.string().transform((value, context) => {
  const upc = normalizeUpc(value)
  if (upc) return upc
  context.addIssue({
    code: 'custom',
    message: 'Enter a 12- or 13-digit UPC/EAN with a valid check digit',
  })
  return z.NEVER
})

export const UpdateReleaseSchema = z
  .strictObject({
    title: CreateReleaseSchema.shape.title.optional(),
    type: z.enum(AlbumType).optional(),
    scheduledAt: z.iso
      .datetime({ offset: true, precision: 3 })
      .refine((value) => {
        const year = new Date(value).getUTCFullYear()
        return year >= 1 && year <= 9999
      }, 'Invalid planned date')
      .nullable()
      .optional()
      .describe(
        'Planned instant, ISO 8601 with milliseconds and timezone; null clears the plan. Does not submit delivery.',
      ),
    upc: UpcSchema.nullable()
      .optional()
      .describe(
        'Release barcode (UPC-A or EAN-13), stored as its 13-digit GTIN; null clears it. Optional for submission.',
      ),
    expectedUpdatedAt: z.iso.datetime({ offset: true }).describe('Version read before editing'),
  })
  .refine(
    (input) =>
      input.title !== undefined ||
      input.type !== undefined ||
      input.scheduledAt !== undefined ||
      input.upc !== undefined,
    {
      message: 'Provide a title, release type, planned date or UPC',
    },
  )

export class UpdateReleaseDto extends createZodDto(UpdateReleaseSchema) {}
