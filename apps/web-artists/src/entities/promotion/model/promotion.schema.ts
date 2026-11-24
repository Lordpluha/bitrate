import { z } from 'zod'

export const promotionGoals = ['STREAMS', 'FOLLOWERS', 'BUZZ'] as const
export const promotionChannels = [
  'INSTAGRAM',
  'TIKTOK',
  'TELEGRAM',
  'YOUTUBE_SHORTS',
] as const
export const translationLanguages = ['uk', 'pl'] as const

const dateTime = z.iso.datetime({ offset: true })
const channel = z.enum(promotionChannels)

export const promotionProfileSchema = z.object({
  goal: z.enum(promotionGoals),
  channels: z.array(channel),
  weeklyHours: z.number().int(),
  countries: z.array(z.string()),
  audience: z.string().nullable(),
  voiceWords: z.array(z.string()),
  voiceExamples: z.array(z.string()),
  updatedAt: dateTime,
})
export type PromotionProfile = z.infer<typeof promotionProfileSchema>

export const aiAllowanceSchema = z.object({
  usedMicroUsd: z.number().int(),
  limitMicroUsd: z.number().int(),
  resetsAt: dateTime,
  enabled: z.boolean(),
})
export type AiAllowance = z.infer<typeof aiAllowanceSchema>

export const promotionStepSchema = z.object({
  id: z.uuid(),
  position: z.number().int(),
  offsetDays: z.number().int(),
  dueAt: dateTime.nullable(),
  phase: z.enum(['PRE', 'LAUNCH', 'POST']),
  kind: z.enum(['POST', 'FOLLOWER_MESSAGE', 'COUNTDOWN', 'ACTION']),
  channels: z.array(channel),
  title: z.string(),
  body: z.string(),
  state: z.enum(['SUGGESTED', 'APPROVED', 'EDITED', 'REJECTED', 'DONE']),
  aiGenerated: z.boolean(),
  regenerating: z.boolean(),
  regenerationFailure: z.string().nullable(),
})
export type PromotionStep = z.infer<typeof promotionStepSchema>
export type StepState = PromotionStep['state']
export type StepPhase = PromotionStep['phase']

export const promotionPlanSchema = z.object({
  id: z.uuid(),
  version: z.number().int(),
  status: z.enum(['GENERATING', 'READY', 'FAILED']),
  failure: z.string().nullable(),
  createdAt: dateTime,
  releaseDate: dateTime.nullable(),
  steps: z.array(promotionStepSchema),
})
export type PromotionPlan = z.infer<typeof promotionPlanSchema>

export const promotionTranslationSchema = z.object({
  id: z.uuid(),
  language: z.enum(translationLanguages),
  text: z.string(),
  state: z.enum(['TRANSLATING', 'MACHINE', 'EDITED', 'STALE', 'FAILED']),
  aiGenerated: z.boolean(),
  rating: z.union([z.literal(1), z.literal(-1)]).nullable(),
})
export type PromotionTranslation = z.infer<typeof promotionTranslationSchema>

export const promotionPostSchema = z.object({
  id: z.uuid(),
  channel,
  text: z.string(),
  hashtags: z.array(z.string()),
  aiGenerated: z.boolean(),
  revision: z.number().int(),
  maxLength: z.number().int(),
  translations: z.array(promotionTranslationSchema),
})
export type PromotionPost = z.infer<typeof promotionPostSchema>

export const stepPostsSchema = z.object({
  stepId: z.uuid(),
  status: z.enum(['GENERATING', 'READY', 'FAILED']).nullable(),
  failure: z.string().nullable(),
  posts: z.array(promotionPostSchema),
})
export type StepPosts = z.infer<typeof stepPostsSchema>

export const calendarEntrySchema = promotionStepSchema
  .pick({
    offsetDays: true,
    phase: true,
    kind: true,
    channels: true,
    title: true,
    state: true,
    aiGenerated: true,
  })
  .extend({
    stepId: z.uuid(),
    releaseId: z.uuid(),
    releaseTitle: z.string(),
    cover: z.string().nullable(),
    dueAt: dateTime,
  })
export type CalendarEntry = z.infer<typeof calendarEntrySchema>
