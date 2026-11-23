import type {
  PromotionChannel,
  PromotionGoal,
  PromotionStepKind,
  PromotionStepPhase,
} from '@prisma/client'
import { z } from 'zod'

/** A plan covers four weeks before and four weeks after the release date (spec D-11). */
export const PLAN_WINDOW_DAYS = 28
const DAY_MS = 86_400_000

const CHANNELS = ['INSTAGRAM', 'TIKTOK', 'TELEGRAM', 'YOUTUBE_SHORTS'] as const
const KINDS = ['POST', 'FOLLOWER_MESSAGE', 'COUNTDOWN', 'ACTION'] as const

/** What the model must return; anything else counts as a rejected attempt. */
export const PlanOutputSchema = z.object({
  steps: z
    .array(
      z.object({
        offsetDays: z.number().int().min(-PLAN_WINDOW_DAYS).max(PLAN_WINDOW_DAYS),
        kind: z.enum(KINDS),
        channels: z.array(z.enum(CHANNELS)),
        title: z.string().min(3).max(120),
        body: z.string().min(1).max(600),
      }),
    )
    .min(3)
    .max(16),
})
export type PlanOutput = z.infer<typeof PlanOutputSchema>

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

export interface PlanStepRow {
  position: number
  offsetDays: number
  phase: PromotionStepPhase
  kind: PromotionStepKind
  channels: PromotionChannel[]
  title: string
  body: string
}

const GOAL_TEXT: Record<PromotionGoal, string> = {
  STREAMS: 'more plays on Bitrate',
  FOLLOWERS: 'new followers on Bitrate',
  BUZZ: 'anticipation before the release',
}

export const phaseFor = (offsetDays: number): PromotionStepPhase =>
  offsetDays < 0 ? 'PRE' : offsetDays === 0 ? 'LAUNCH' : 'POST'

/** The step's date: the release date moved by the offset, so the plan follows the release. */
export const stepDate = (scheduledAt: Date, offsetDays: number) =>
  new Date(scheduledAt.getTime() + offsetDays * DAY_MS)

/** The ways a release date may appear in copy, so the grounding check accepts each of them. */
export function dateFacts(date: Date): string[] {
  const opts = { timeZone: 'UTC' } as const
  return [
    date.toISOString().slice(0, 10),
    date.toLocaleDateString('en-US', { ...opts, month: 'short', day: 'numeric', year: 'numeric' }),
    date.toLocaleDateString('en-US', { ...opts, month: 'long', day: 'numeric' }),
    date.toLocaleDateString('en-GB', { ...opts, day: 'numeric', month: 'long', year: 'numeric' }),
  ]
}

export const PLAN_SYSTEM_PROMPT = [
  'You plan the promotion of one music release for an independent artist.',
  `Return dated steps from ${-PLAN_WINDOW_DAYS} to ${PLAN_WINDOW_DAYS} days around the release date (0 = release day).`,
  'Kinds: POST (a social post on the given channels), FOLLOWER_MESSAGE (one message to Bitrate followers on day 0),',
  'COUNTDOWN (a "coming soon" tile on the Bitrate artist page, before day 0), ACTION (an off-platform task).',
  'Use only the channels the artist uses. Fit the plan into the weekly time the artist has.',
  'State only facts from the context: never invent numbers, chart positions, awards, collaborators, venues, links or dates.',
  'Never promise results. Write in English, plainly, in the voice the artist describes.',
].join('\n')

/** The prompt and the grounding facts for one plan generation. */
export function buildPlanRequest(
  release: ReleaseFacts,
  profile: ProfileFacts,
  kept: readonly KeptStep[],
): { prompt: string; facts: string[] } {
  const lines = [
    `Release: "${release.title}" (${release.type.toLowerCase()}), out ${dateFacts(release.scheduledAt)[1]}.`,
    `Artist: ${release.artistName}.`,
    release.bio ? `Artist bio: ${release.bio}` : 'Artist bio: none.',
    `Tracks: ${release.trackTitles.join('; ') || 'not listed'}.`,
    `Genres: ${release.genres.join(', ') || 'not listed'}.`,
    `Territories: ${release.territories.join(', ') || 'worldwide'}.`,
    `Goal: ${GOAL_TEXT[profile.goal]}.`,
    `Channels the artist uses: ${profile.channels.join(', ')}.`,
    `Time for promotion: ${profile.weeklyHours} hours a week.`,
    `Main audience: ${[profile.countries.join(', '), profile.audience].filter(Boolean).join(' · ') || 'not described'}.`,
    `Voice: ${profile.voiceWords.join(', ') || 'not described'}.`,
    ...profile.voiceExamples.map((example, i) => `Example post ${i + 1} by the artist: ${example}`),
  ]
  if (kept.length > 0) {
    lines.push(
      'The artist already kept these steps; do not repeat them:',
      ...kept.map((step) => `- day ${step.offsetDays}, ${step.kind}: ${step.title}`),
    )
  }
  const facts = [
    ...lines,
    ...dateFacts(release.scheduledAt),
    String(release.scheduledAt.getUTCFullYear()),
  ]
  return { prompt: lines.join('\n'), facts }
}

export const planText = (output: PlanOutput) =>
  output.steps.map((step) => `${step.title}\n${step.body}`).join('\n')

/**
 * Turns model output into step rows: phase from the offset, channels limited to the artist's,
 * one follower message on release day, countdowns only before it, ordered by date.
 */
export function normaliseSteps(
  output: PlanOutput,
  channels: readonly PromotionChannel[],
  firstPosition: number,
): PlanStepRow[] {
  const allowed = new Set(channels)
  let followerMessage = false
  const rows: Omit<PlanStepRow, 'position'>[] = []
  for (const step of output.steps) {
    if (step.kind === 'FOLLOWER_MESSAGE') {
      if (followerMessage) continue
      followerMessage = true
    }
    if (step.kind === 'COUNTDOWN' && step.offsetDays >= 0) continue
    const offsetDays = step.kind === 'FOLLOWER_MESSAGE' ? 0 : step.offsetDays
    const stepChannels = step.kind === 'POST' ? step.channels.filter((c) => allowed.has(c)) : []
    if (step.kind === 'POST' && stepChannels.length === 0) continue
    rows.push({
      offsetDays,
      phase: phaseFor(offsetDays),
      kind: step.kind,
      channels: stepChannels,
      title: step.title.trim(),
      body: step.body.trim(),
    })
  }
  return rows
    .sort((a, b) => a.offsetDays - b.offsetDays)
    .map((row, i) => ({ ...row, position: firstPosition + i }))
}
