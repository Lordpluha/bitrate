import { describe, expect, it } from 'vitest'
import { downsamplePeaks } from './peaks'

describe('downsamplePeaks', () => {
  it('keeps the loudest value of each bucket', () => {
    expect(downsamplePeaks([0.1, 0.9, 0.2, 0.4], 2)).toEqual([0.9, 0.4])
  })

  it('draws a flat line when there are no peaks', () => {
    expect(downsamplePeaks([], 3)).toEqual([0.08, 0.08, 0.08])
  })

  it('never returns a bar thinner than the floor or louder than 1', () => {
    expect(downsamplePeaks([0, 0, 2], 3)).toEqual([0.06, 0.06, 1])
  })

  it('repeats values when asked for more bars than peaks', () => {
    expect(downsamplePeaks([0.5], 3)).toEqual([0.5, 0.5, 0.5])
  })
})
