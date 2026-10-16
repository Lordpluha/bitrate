import { ArtistNotificationCategory } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RELEASE_VALIDATION } from '../errors'

export const UpdateNotificationPreferencesSchema = z.strictObject({
  mutedInApp: z
    .array(z.enum(ArtistNotificationCategory))
    .max(Object.keys(ArtistNotificationCategory).length)
    .refine((items) => new Set(items).size === items.length, RELEASE_VALIDATION.DUPLICATE_ITEMS)
    .describe('Categories left out of the in-app notification center'),
})

export class UpdateNotificationPreferencesDto extends createZodDto(
  UpdateNotificationPreferencesSchema,
) {}
