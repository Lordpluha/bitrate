import type { ApiSchemas } from '@bitrate/contracts'
import type { TranslationKey } from '@shared/i18n'
import { z } from 'zod'

export const notificationCategories = ['REVIEW', 'DELIVERY'] as const
export type NotificationCategory = (typeof notificationCategories)[number]

/** Catalog keys; render them with `t()`. */
export const notificationCategoryLabels = {
  REVIEW: {
    title: 'notifications.category.review',
    hint: 'notifications.category.reviewHint',
  },
  DELIVERY: {
    title: 'notifications.category.delivery',
    hint: 'notifications.category.deliveryHint',
  },
} as const satisfies Record<
  NotificationCategory,
  { title: TranslationKey; hint: TranslationKey }
>

export const notificationPreferencesSchema = z.object({
  // The API keeps a TASKS category for release tasks, which the workspace no longer shows.
  mutedInApp: z
    .array(z.enum([...notificationCategories, 'TASKS']))
    .transform((categories) =>
      categories.filter(
        (category): category is NotificationCategory => category !== 'TASKS',
      ),
    ),
}) satisfies z.ZodType<ApiSchemas['ArtistNotificationPreferencesEntity']>

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>
