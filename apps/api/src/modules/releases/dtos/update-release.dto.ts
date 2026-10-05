import { AlbumType } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { CreateReleaseSchema } from './create-release.dto'

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
    expectedUpdatedAt: z.iso.datetime({ offset: true }).describe('Version read before editing'),
  })
  .refine(
    (input) =>
      input.title !== undefined || input.type !== undefined || input.scheduledAt !== undefined,
    {
      message: 'Provide a title, release type or planned date',
    },
  )

export class UpdateReleaseDto extends createZodDto(UpdateReleaseSchema) {}
