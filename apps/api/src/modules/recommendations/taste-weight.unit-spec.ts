import { describe, expect, it } from '@jest/globals'
import { OTHERS_JAM_PICK_WEIGHT, SYSTEM_CHOSEN_WEIGHT, tasteWeight } from './taste-weight'

describe('tasteWeight', () => {
  it.each([
    'PLAYLIST',
    'ALBUM',
    'ARTIST',
    'SEARCH',
    'LIBRARY',
    'HOME',
    'CHART',
    'HISTORY',
    'OTHER',
  ] as const)('counts a play the listener chose from %s fully', (source) => {
    expect(tasteWeight({ source, queuedByListener: true })).toBe(1)
  })

  it.each(['RADIO', 'AUTOPLAY', 'MOOD', 'GENERATED_PLAYLIST'] as const)(
    'down-weights a play the system chose (%s)',
    (source) => {
      expect(tasteWeight({ source, queuedByListener: true })).toBe(SYSTEM_CHOSEN_WEIGHT)
      expect(SYSTEM_CHOSEN_WEIGHT).toBeLessThan(1)
    },
  )

  it('counts the listener’s own pick in a Jam fully', () => {
    expect(tasteWeight({ source: 'JAM', queuedByListener: true })).toBe(1)
  })

  it('down-weights a Jam track someone else queued', () => {
    expect(tasteWeight({ source: 'JAM', queuedByListener: false })).toBe(OTHERS_JAM_PICK_WEIGHT)
    expect(OTHERS_JAM_PICK_WEIGHT).toBeLessThan(1)
  })
})
