import type { ApiSchemas } from '@bitrate/contracts'
import {
  type PromotionProfile,
  promotionChannels,
  promotionGoals,
} from '@entities/promotion'
import { messageKey } from '@shared/i18n'
import { z } from 'zod'
import { hasContactDetails } from './contactDetails'

/** Comma-separated entries, trimmed, without empty ones. */
const listOf = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const noContacts = (max: number) =>
  z
    .string()
    .max(max)
    .refine((text) => !hasContactDetails(text), {
      message: messageKey('validation.promotion.contact_details'),
    })

export const profileFormSchema = z.object({
  goal: z.enum(promotionGoals),
  channels: z
    .array(z.enum(promotionChannels))
    .min(1, messageKey('promotion.profile.channelsError')),
  weeklyHours: z
    .number(messageKey('promotion.profile.weeklyError'))
    .int(messageKey('promotion.profile.weeklyError'))
    .min(1, messageKey('promotion.profile.weeklyError'))
    .max(40, messageKey('promotion.profile.weeklyError')),
  countries: z.string().refine(
    (value) => {
      const codes = listOf(value)
      return (
        codes.length <= 5 && codes.every((code) => /^[a-z]{2}$/i.test(code))
      )
    },
    { message: messageKey('promotion.profile.countriesError') },
  ),
  audience: noContacts(200),
  voiceWords: z.string().refine(
    (value) => {
      const words = listOf(value)
      return words.length <= 3 && words.every((word) => word.length <= 30)
    },
    { message: messageKey('promotion.profile.voiceWordsError') },
  ),
  examples: z.array(noContacts(500)).length(3),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

/** The form for an existing profile, or a blank one before the first save. */
export function profileFormDefaults(
  profile: PromotionProfile | null,
): ProfileFormValues {
  const examples = profile?.voiceExamples ?? []
  return {
    goal: profile?.goal ?? 'BUZZ',
    channels: profile?.channels ?? [],
    weeklyHours: profile?.weeklyHours ?? 2,
    countries: profile?.countries.join(', ') ?? '',
    audience: profile?.audience ?? '',
    voiceWords: profile?.voiceWords.join(', ') ?? '',
    examples: [0, 1, 2].map((index) => examples[index] ?? ''),
  }
}

export function toProfileInput(
  values: ProfileFormValues,
): ApiSchemas['PromotionProfileDto'] {
  return {
    goal: values.goal,
    channels: values.channels,
    weeklyHours: values.weeklyHours,
    countries: listOf(values.countries).map((code) => code.toUpperCase()),
    audience: values.audience.trim() || null,
    voiceWords: listOf(values.voiceWords),
    voiceExamples: values.examples
      .map((example) => example.trim())
      .filter(Boolean),
  }
}
