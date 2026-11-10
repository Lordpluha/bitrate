import { describe, expect, it } from 'vitest'
import { fitLanding } from './fit'

describe('fitLanding', () => {
  it('shows one scene per screen when the board fits the window well', () => {
    expect(fitLanding({ width: 1440, height: 900 })).toEqual({
      mode: 'scenes',
      scale: 1,
    })
    expect(fitLanding({ width: 1920, height: 1080 })).toEqual({
      mode: 'scenes',
      scale: 1.2,
    })
    /* a 125%-scaled laptop: the board loses only a few percent */
    expect(fitLanding({ width: 1536, height: 864 }).mode).toBe('scenes')
  })

  it('lets short laptops scroll through scenes fitted to the width, so nothing is drawn small', () => {
    expect(fitLanding({ width: 1366, height: 768 })).toEqual({
      mode: 'tall',
      scale: 1366 / 1440,
    })
    expect(fitLanding({ width: 1280, height: 720 })).toEqual({
      mode: 'tall',
      scale: 1280 / 1440,
    })
  })

  it('keeps scenes on a narrow, tall window, where the width is what limits the board', () => {
    expect(fitLanding({ width: 1024, height: 900 })).toEqual({
      mode: 'scenes',
      scale: 1024 / 1440,
    })
  })

  it('leaves phones to their own column layout', () => {
    expect(fitLanding({ width: 390, height: 844 }).mode).toBe('phone')
    expect(fitLanding({ width: 820, height: 1180 }).mode).toBe('phone')
  })
})
