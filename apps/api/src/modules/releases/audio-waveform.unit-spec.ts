import { describe, expect, it } from '@jest/globals'
import { waveformFromPcm } from './audio-waveform'

describe('waveformFromPcm', () => {
  it('keeps the loudest sample of each bucket, scaled so the peak is 1', () => {
    const samples = Int16Array.from([0, 100, -400, 50, 200, -200, 0, 800])
    expect(waveformFromPcm(samples, 4)).toEqual([0.125, 0.5, 0.25, 1])
  })

  it('returns silence as zeros and no audio as an empty waveform', () => {
    expect(waveformFromPcm(new Int16Array(6), 3)).toEqual([0, 0, 0])
    expect(waveformFromPcm(new Int16Array(0), 3)).toEqual([])
  })

  it('never returns more points than there are samples', () => {
    expect(waveformFromPcm(Int16Array.from([10, -20]), 200)).toEqual([0.5, 1])
  })
})
