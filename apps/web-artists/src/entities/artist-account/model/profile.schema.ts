import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const socialLinkKeys = [
  'website',
  'instagram',
  'x',
  'youtube',
  'tiktok',
  'soundcloud',
] as const

type SocialLinkKey = (typeof socialLinkKeys)[number]

export const socialLinkLabels = {
  website: 'Website',
  instagram: 'Instagram',
  x: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  soundcloud: 'SoundCloud',
} satisfies Record<SocialLinkKey, string>

const link = z.url().optional()

export const artistProfileSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.string(),
  bio: z.string().nullable(),
  country: z.string().length(2).nullable(),
  socials: z.object({
    website: link,
    instagram: link,
    x: link,
    youtube: link,
    tiktok: link,
    soundcloud: link,
  }),
  avatar: z.string().nullable(),
  backgroundImage: z.string().nullable(),
  verified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  emailVerified: z.boolean(),
  locale: z.enum(['en', 'uk', 'pl']),
  updatedAt: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<ApiSchemas['ArtistProfileEntity']>

export type ArtistProfile = z.infer<typeof artistProfileSchema>

const optionalHttps = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^https:\/\/\S+$/.test(value),
    'Enter a full https:// link.',
  )

/** Editor values; empty strings mean "not set" and are sent as null. */
export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(50, 'Use at most 50 characters.')
    .regex(
      /^[A-Za-z0-9._-]+$/,
      'Use letters, digits, dots, dashes and underscores.',
    ),
  bio: z.string().max(500, 'Keep the bio under 500 characters.'),
  country: z.string(),
  website: optionalHttps,
  instagram: optionalHttps,
  x: optionalHttps,
  youtube: optionalHttps,
  tiktok: optionalHttps,
  soundcloud: optionalHttps,
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function profileFormDefaults(profile: ArtistProfile): ProfileFormValues {
  return {
    username: profile.username,
    bio: profile.bio ?? '',
    country: profile.country ?? '',
    website: profile.socials.website ?? '',
    instagram: profile.socials.instagram ?? '',
    x: profile.socials.x ?? '',
    youtube: profile.socials.youtube ?? '',
    tiktok: profile.socials.tiktok ?? '',
    soundcloud: profile.socials.soundcloud ?? '',
  }
}
