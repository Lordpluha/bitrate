import type { PromotionChannel } from '@prisma/client'
import { dateFacts } from '../../plans/generation'
import { CHANNEL_FORMATS } from './channel-formats'

export interface PostsContext {
  step: { title: string; body: string; channels: readonly PromotionChannel[] }
  release: { title: string; scheduledAt: Date; trackTitles: readonly string[] }
  artist: { name: string; bio: string | null }
  voice: { words: readonly string[]; examples: readonly string[] }
}

/** The prompt and the grounding facts for the drafts of one POST step. */
export function buildPostsRequest(context: PostsContext): { prompt: string; facts: string[] } {
  const { step, release, artist, voice } = context
  const lines = [
    `Release: "${release.title}", out ${dateFacts(release.scheduledAt)[1]}.`,
    `Tracks: ${release.trackTitles.join('; ') || 'not listed'}.`,
    `Artist: ${artist.name}. ${artist.bio ? `Bio: ${artist.bio}` : 'No bio.'}`,
    `Plan step: ${step.title}. ${step.body}`,
    `Voice: ${voice.words.join(', ') || 'not described'}.`,
    ...voice.examples.map((example, i) => `Example post ${i + 1} by the artist: ${example}`),
    'Write one draft for each channel:',
    ...step.channels.map(
      (channel) =>
        `- ${channel}: ${CHANNEL_FORMATS[channel].format}, at most ${CHANNEL_FORMATS[channel].maxLength} characters.`,
    ),
  ]
  const facts = [
    ...lines,
    ...dateFacts(release.scheduledAt),
    String(release.scheduledAt.getUTCFullYear()),
  ]
  return { prompt: lines.join('\n'), facts }
}
