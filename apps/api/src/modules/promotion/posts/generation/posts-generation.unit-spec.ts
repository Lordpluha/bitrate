import { describe, expect, it } from '@jest/globals'
import { buildPostsRequest } from './build-posts-request'
import { PostsOutputSchema } from './posts-output.schema'

const context = {
  step: {
    title: 'Announce the release date',
    body: 'Tell followers when it comes out.',
    channels: ['INSTAGRAM' as const, 'TIKTOK' as const],
  },
  release: {
    title: 'Afterglow',
    scheduledAt: new Date('2026-09-26T18:00:00Z'),
    trackTitles: ['Afterglow'],
  },
  artist: { name: 'Demo Artist', bio: 'Played 120 shows.' },
  voice: { words: ['calm'], examples: ['Wrote this at 3 a.m.'] },
}

describe('buildPostsRequest', () => {
  it('asks for one draft per channel in its format and limit', () => {
    const { prompt } = buildPostsRequest(context)
    expect(prompt).toContain('- INSTAGRAM: an Instagram caption, at most 2200 characters.')
    expect(prompt).toContain('- TIKTOK: a 15-second TikTok hook script')
    expect(prompt).toContain('Plan step: Announce the release date.')
  })

  it('makes the release date, the bio and the step grounding facts', () => {
    const { facts } = buildPostsRequest(context)
    expect(facts).toEqual(expect.arrayContaining(['Sep 26, 2026', '2026']))
    expect(facts.join('\n')).toContain('Played 120 shows.')
  })
})

describe('PostsOutputSchema', () => {
  const post = (channel: string, text: string) => ({ channel, text, hashtags: ['#afterglow'] })

  it('accepts drafts within their channel limits', () => {
    const output = { posts: [post('INSTAGRAM', 'Afterglow arrives Sep 26.')] }
    expect(PostsOutputSchema.safeParse(output).success).toBe(true)
  })

  it('rejects a draft over its channel limit and malformed hashtags', () => {
    expect(PostsOutputSchema.safeParse({ posts: [post('TIKTOK', 'x'.repeat(601))] }).success).toBe(
      false,
    )
    const badTag = { posts: [{ ...post('INSTAGRAM', 'Hi'), hashtags: ['no hash'] }] }
    expect(PostsOutputSchema.safeParse(badTag).success).toBe(false)
  })
})
