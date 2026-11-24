import { describe, expect, it } from '@jest/globals'
import { findUngroundedClaims } from './grounding'

const facts = [
  'Release: Afterglow · Single · Sep 26, 2026',
  'Genres: indie, lo-fi',
  'Artist bio: Played 120 shows across Ukraine. Find me at demoartist.com',
]

const kinds = (text: string) => findUngroundedClaims(text, facts).map((c) => `${c.kind}:${c.value}`)

describe('findUngroundedClaims', () => {
  it('accepts copy that only uses facts from the context', () => {
    expect(
      kinds('Afterglow arrives Sep 26, 2026. After 120 shows, a quiet song. demoartist.com'),
    ).toEqual([])
  })

  it('treats small counts and durations as wording, not claims', () => {
    expect(kinds('Share a 15-second hook with three friends on day 3.')).toEqual([])
  })

  it('reports invented numbers, percentages and scaled counts', () => {
    expect(kinds('Already 25,000 streams, 40% more than last time, 2m views')).toEqual([
      'number:25,000',
      'number:40%',
      'number:2m',
    ])
  })

  it('reports a year the context does not contain', () => {
    expect(kinds('Back since 2019 with Afterglow (2026).')).toEqual(['year:2019'])
  })

  it('reports invented links, emails, handles and ranks', () => {
    expect(
      kinds('Listen at afterglow.fm, write to me@mail.com, thanks @bigcurator, #1 in Kyiv'),
    ).toEqual(['email:me@mail.com', 'url:afterglow.fm', 'handle:@bigcurator', 'rank:#1'])
  })

  it('reports achievement claims absent from the context', () => {
    expect(kinds('The award-winning, chart-topping single went viral.')).toEqual([
      'achievement:chart-topping',
      'achievement:award-winning',
      'achievement:viral',
    ])
  })

  it('accepts an achievement the context states', () => {
    expect(
      findUngroundedClaims('Nominated for the Jager award.', [
        'Bio: nominated for the Jager award in 2025',
      ]),
    ).toEqual([])
  })
})
