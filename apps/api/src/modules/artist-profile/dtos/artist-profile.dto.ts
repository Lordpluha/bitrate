import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const httpsLink = z
  .url({ protocol: /^https$/ })
  .max(500)
  .nullable()
  .optional()

/** Links the profile editor offers; each is an https URL, null to clear, or absent. */
export const ArtistSocialsSchema = z.strictObject({
  website: httpsLink,
  instagram: httpsLink,
  x: httpsLink,
  youtube: httpsLink,
  tiktok: httpsLink,
  soundcloud: httpsLink,
})

const expectedUpdatedAt = z.iso
  .datetime({ offset: true })
  .describe('Profile version read before editing')

export const UpdateArtistProfileSchema = z.strictObject({
  username: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9._-]+$/)
    .optional()
    .describe('Public handle: letters, digits, dots, dashes and underscores'),
  bio: z
    .string()
    .trim()
    .max(500)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional(),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/)
    .nullable()
    .optional()
    .describe('ISO 3166-1 alpha-2 country code; null clears it'),
  socials: ArtistSocialsSchema.optional().describe('Links shown on the public profile'),
  expectedUpdatedAt,
})

export const ProfileImageVersionSchema = z.strictObject({ expectedUpdatedAt })

export class UpdateArtistProfileDto extends createZodDto(UpdateArtistProfileSchema) {}
export class ProfileImageVersionDto extends createZodDto(ProfileImageVersionSchema) {}
