import { createI18n } from '@shared/i18n'
import { describe, expect, it } from 'vitest'
import { summarizeListening } from './listeningSummary'

const page = <T>(data: T[], total: number) => ({
  data,
  limit: 10,
  page: 1,
  total,
})

const artist = {
  avatar: null,
  bio: null,
  id: 'a1',
  plays: 41,
  username: 'Luma Vale',
}
const track = {
  artist: { avatar: null, id: 'a1', username: 'Luma Vale' },
  artistId: 'a1',
  cover: null,
  id: 't1',
  plays: 1,
  title: 'Afterglow',
}

describe('summarizeListening', () => {
  it('turns the top lists into the four stat tiles', () => {
    expect(
      summarizeListening({
        artists: page([artist], 12),
        i18n: createI18n({ locale: 'en' }),
        tracks: page([track], 342),
      }),
    ).toEqual([
      { label: 'Tracks', sub: 'tracks played', value: '342' },
      { label: 'Artists', sub: 'artists played', value: '12' },
      { label: 'Top artist', sub: '41 plays', value: 'Luma Vale' },
      { label: 'Top track', sub: '1 play · Luma Vale', value: 'Afterglow' },
    ])
  })

  it('labels the tiles and groups the numbers in the app locale', () => {
    const stats = summarizeListening({
      artists: page([{ ...artist, plays: 5 }], 12),
      i18n: createI18n({ locale: 'uk' }),
      tracks: page([{ ...track, plays: 3 }], 12_345),
    })

    expect(stats?.[0]?.label).toBe('Треки')
    expect(stats?.[0]?.value.replace(/\s/g, ' ')).toBe('12 345')
    expect(stats?.[2]?.sub).toBe('5 прослуховувань')
    expect(stats?.[3]?.sub).toBe('3 прослуховування · Luma Vale')
  })

  it('has nothing to summarise before the first play', () => {
    expect(
      summarizeListening({
        artists: page([], 0),
        i18n: createI18n({ locale: 'en' }),
        tracks: page([], 0),
      }),
    ).toBeNull()
  })
})
