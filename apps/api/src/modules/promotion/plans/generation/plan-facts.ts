import type {
  PromotionChannel,
  PromotionGoal,
  PromotionStepKind,
  PromotionStepPhase,
} from '@prisma/client'

/** The release as the model may describe it. */
export interface ReleaseFacts {
  title: string
  type: string
  scheduledAt: Date
  trackTitles: readonly string[]
  genres: readonly string[]
  territories: readonly string[]
  artistName: string
  bio: string | null
}

/** The artist's promotion profile as the model reads it. */
export interface ProfileFacts {
  goal: PromotionGoal
  channels: readonly PromotionChannel[]
  weeklyHours: number
  countries: readonly string[]
  audience: string | null
  voiceWords: readonly string[]
  voiceExamples: readonly string[]
}

/** A step the artist already approved, edited or finished; regeneration keeps it as is. */
export interface KeptStep {
  offsetDays: number
  kind: PromotionStepKind
  title: string
}

/** A suggested step ready to be written to `PromotionPlanStep`. */
export interface PlanStepRow {
  position: number
  offsetDays: number
  phase: PromotionStepPhase
  kind: PromotionStepKind
  channels: PromotionChannel[]
  title: string
  body: string
}
