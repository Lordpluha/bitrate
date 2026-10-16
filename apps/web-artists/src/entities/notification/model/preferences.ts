import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const notificationCategories = ['TASKS', 'REVIEW', 'DELIVERY'] as const
export type NotificationCategory = (typeof notificationCategories)[number]

export const notificationCategoryLabels = {
  TASKS: {
    title: 'Tasks and deadlines',
    hint: 'Overdue tasks and tasks due within 48 hours',
  },
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
  mutedInApp: z.array(z.enum(notificationCategories)),
}) satisfies z.ZodType<ApiSchemas['ArtistNotificationPreferencesEntity']>

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>
