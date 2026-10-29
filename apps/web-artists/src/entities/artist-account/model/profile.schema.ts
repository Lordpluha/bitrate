import type { ApiSchemas } from '@bitrate/contracts'
import { messageKey, type TranslationKey } from '@shared/i18n'
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

/** Catalog keys; render them with `t()`. Only “Website” changes between languages. */
export const socialLinkLabels = {
  website: 'profile.social.website',
  instagram: 'profile.social.instagram',
  x: 'profile.social.x',
  youtube: 'profile.social.youtube',
  tiktok: 'profile.social.tiktok',
  soundcloud: 'profile.social.soundcloud',
} satisfies Record<SocialLinkKey, TranslationKey>

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
  updatedAt: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<ApiSchemas['ArtistProfileEntity']>

export type ArtistProfile = z.infer<typeof artistProfileSchema>

const optionalHttps = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^https:\/\/\S+$/.test(value),
    messageKey('profile.validation.https'),
  )

/** Editor values; empty strings mean "not set" and are sent as null. */
export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, messageKey('profile.validation.min'))
    .max(50, messageKey('profile.validation.max'))
    .regex(/^[A-Za-z0-9._-]+$/, messageKey('profile.validation.chars')),
  bio: z.string().max(500, messageKey('profile.validation.bio')),
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
