import type { PromotionGoal } from '@prisma/client'
import { dateFacts } from './date-facts'
import type { KeptStep, ProfileFacts, ReleaseFacts } from './plan-facts'

const GOAL_TEXT: Record<PromotionGoal, string> = {
  STREAMS: 'more plays on Bitrate',
  FOLLOWERS: 'new followers on Bitrate',
  BUZZ: 'anticipation before the release',
}

/** The prompt and the grounding facts for one plan generation. */
export function buildPlanRequest(
  release: ReleaseFacts,
  profile: ProfileFacts,
  kept: readonly KeptStep[],
): { prompt: string; facts: string[] } {
  const audience = [profile.countries.join(', '), profile.audience].filter(Boolean).join(' · ')
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
    `Main audience: ${audience || 'not described'}.`,
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
