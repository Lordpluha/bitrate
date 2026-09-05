import { z } from 'zod'

export const meSettingsSchema = z.object({
  autoplay: z.boolean(),
  compactLibrary: z.boolean(),
  explicitContent: z.boolean(),
  language: z.string(),
  normalizeVolume: z.boolean(),
  privateSession: z.boolean(),
  showNowPlaying: z.boolean(),
  streamingQuality: z.enum(['automatic', 'low', 'normal', 'high', 'very-high']),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional(),
})

export const updateMeSettingsSchema = meSettingsSchema
  .omit({ updatedAt: true, userId: true })
  .partial()

export const notificationSchema = z.object({
  body: z.string(),
  createdAt: z.coerce.date(),
  id: z.string(),
  payload: z.unknown().nullable(),
  readAt: z.coerce.date().nullable(),
  title: z.string(),
  type: z.enum(['NEW_RELEASE', 'PLAYLIST_UPDATE', 'FOLLOW', 'SYSTEM']),
  userId: z.string(),
})

export const notificationsSchema = z.object({
  data: z.array(notificationSchema),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
  unread: z.number(),
})

export const subscriptionSchema = z.object({
  createdAt: z.coerce.date().optional(),
  currentPeriodEnd: z.coerce.date().nullable().optional(),
  currentPeriodStart: z.coerce.date().nullable().optional(),
  id: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM_INDIVIDUAL', 'PREMIUM_DUO', 'PREMIUM_FAMILY']),
  provider: z.string().nullable().optional(),
  providerSubscriptionId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED']),
  updatedAt: z.coerce.date().optional(),
  userId: z.string(),
})

export type MeSettings = z.infer<typeof meSettingsSchema>
export type Notification = z.infer<typeof notificationSchema>
export type Subscription = z.infer<typeof subscriptionSchema>
export type UpdateMeSettings = z.infer<typeof updateMeSettingsSchema>
