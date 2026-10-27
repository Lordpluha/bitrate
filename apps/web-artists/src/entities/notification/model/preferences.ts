import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const notificationCategories = ['REVIEW', 'DELIVERY'] as const
export type NotificationCategory = (typeof notificationCategories)[number]

export const notificationCategoryLabels = {
  REVIEW: {
    title: 'Bitrate review',
    hint: 'Submissions, approvals and requested changes',
  },
  DELIVERY: {
    title: 'Delivery and release',
    hint: 'Stores going live, failed deliveries and releases',
  },
} as const satisfies Record<
  NotificationCategory,
  { title: string; hint: string }
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
