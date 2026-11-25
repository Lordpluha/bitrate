import type { TranslationKey } from '@shared/i18n'
import type {
  PromotionPlan,
  PromotionStep,
  PromotionTranslation,
  StepPhase,
  StepState,
} from './promotion.schema'

type Channel = PromotionStep['channels'][number]
type Kind = PromotionStep['kind']

/** Brand names stay untranslated. */
export const channelNames: Record<Channel, string> = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  TELEGRAM: 'Telegram',
  YOUTUBE_SHORTS: 'YouTube Shorts',
}

/** Catalog keys; render them with `t()`. */
export const stepStateLabels = {
  SUGGESTED: 'promotion.state.suggested',
  APPROVED: 'promotion.state.approved',
  EDITED: 'promotion.state.edited',
  REJECTED: 'promotion.state.rejected',
  DONE: 'promotion.state.done',
} satisfies Record<StepState, TranslationKey>

/** Chip tone of each state (`data-tone` on `.artist-release-chip`). */
export const stepStateTone = {
  SUGGESTED: 'info',
  APPROVED: 'success',
  EDITED: 'success',
  REJECTED: undefined,
  DONE: 'success',
} satisfies Record<StepState, 'info' | 'success' | undefined>

export const phaseLabels = {
  PRE: 'promotion.phase.pre',
  LAUNCH: 'promotion.phase.launch',
  POST: 'promotion.phase.post',
} satisfies Record<StepPhase, TranslationKey>

export const kindLabels = {
  POST: 'promotion.kind.post',
  FOLLOWER_MESSAGE: 'promotion.kind.followerMessage',
  COUNTDOWN: 'promotion.kind.countdown',
  ACTION: 'promotion.kind.action',
} satisfies Record<Kind, TranslationKey>

export const translationStateLabels = {
  TRANSLATING: 'promotion.translation.translating',
  MACHINE: 'promotion.translation.machine',
  EDITED: 'promotion.translation.edited',
  STALE: 'promotion.translation.stale',
  FAILED: 'promotion.translation.failed',
} satisfies Record<PromotionTranslation['state'], TranslationKey>

/** `T−21`, `T0`, `T+3`: days from the release date, as the plan reads them. */
export function offsetLabel(offsetDays: number): string {
  if (offsetDays === 0) return 'T0'
  return offsetDays < 0 ? `T−${-offsetDays}` : `T+${offsetDays}`
}

/** Micro-dollars as `$0.42`. */
export function formatUsd(microUsd: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(microUsd / 1_000_000)
}

const PHASES: readonly StepPhase[] = ['PRE', 'LAUNCH', 'POST']

/** The plan's steps grouped by phase, in plan order; empty phases are left out. */
export function stepsByPhase(plan: PromotionPlan) {
  return PHASES.map((phase) => ({
    phase,
    steps: plan.steps.filter((step) => step.phase === phase),
  })).filter((group) => group.steps.length > 0)
}

/** Counts for the plan summary tile. */
export function planCounts(plan: PromotionPlan) {
  const count = (states: StepState[]) =>
    plan.steps.filter((step) => states.includes(step.state)).length
  return {
    total: plan.steps.length,
    approved: count(['APPROVED', 'EDITED', 'DONE']),
    rejected: count(['REJECTED']),
    suggested: count(['SUGGESTED']),
  }
}

/** A step's due day, `Sep 5`, in UTC like the release date it is counted from. */
export function formatStepDay(instant: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(instant))
}
