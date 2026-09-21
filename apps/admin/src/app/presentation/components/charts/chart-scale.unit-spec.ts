import { describe, expect, it } from 'vitest'
import {
  axisTicks,
  chartMax,
  hasData,
  maxLabelsForWidth,
  niceCeiling,
  seriesMax,
  stackedMax,
  thinnedLabelIndexes,
  xPosition,
  yPosition,
} from './chart-scale'
import type { ChartSeriesValues } from './chart.types'

describe('niceCeiling', () => {
  it('rounds up to a nice 1/2/5 step above the value', () => {
    expect(niceCeiling(42)).toBe(50)
    expect(niceCeiling(120)).toBe(200)
    expect(niceCeiling(3)).toBe(5)
  })

  it('floors a zero or negative input to 1, never a zero-height scale', () => {
    expect(niceCeiling(0)).toBe(1)
    expect(niceCeiling(-5)).toBe(1)
  })
})

const SERIES: ChartSeriesValues[] = [
  { id: 'a', label: 'A', colorVar: '--color-chart-1', values: [1, 5, 2] },
  { id: 'b', label: 'B', colorVar: '--color-chart-2', values: [3, 1, 4] },
]

describe('seriesMax', () => {
  it('returns the single largest value across every series', () => {
    expect(seriesMax(SERIES)).toBe(5)
  })

  it('returns 0 for an empty series list', () => {
    expect(seriesMax([])).toBe(0)
  })
})

describe('stackedMax', () => {
  it('returns the largest per-index sum across every series', () => {
    expect(stackedMax(SERIES)).toBe(6)
  })
})

describe('chartMax', () => {
  it('is the top axis tick over the stacked sum when stacked', () => {
    expect(chartMax(SERIES, true)).toBe(axisTicks(6).at(-1))
  })

  it('is the top axis tick over the single max when not stacked', () => {
    expect(chartMax(SERIES, false)).toBe(axisTicks(5).at(-1))
  })
})

describe('hasData', () => {
  it('is true when any series carries a positive value', () => {
    expect(hasData(SERIES)).toBe(true)
  })

  it('is false when every value is zero', () => {
    expect(hasData([{ id: 'a', label: 'A', colorVar: '--color-chart-1', values: [0, 0] }])).toBe(
      false,
    )
  })

  it('is false for no series at all', () => {
    expect(hasData([])).toBe(false)
  })
})

describe('yPosition', () => {
  it('maps a value proportionally onto the height, 0 at the bottom', () => {
    expect(yPosition(0, 10, 100)).toBe(100)
    expect(yPosition(10, 10, 100)).toBe(0)
    expect(yPosition(5, 10, 100)).toBe(50)
  })

  it('returns the full height for a zero max, rather than dividing by zero', () => {
    expect(yPosition(5, 0, 100)).toBe(100)
  })

  it('offsets by a top padding when given one', () => {
    expect(yPosition(10, 10, 100, 20)).toBe(20)
    expect(yPosition(0, 10, 100, 20)).toBe(120)
  })
})

describe('xPosition', () => {
  it('spreads categories evenly across the width', () => {
    expect(xPosition(0, 3, 100)).toBe(0)
    expect(xPosition(2, 3, 100)).toBe(100)
  })

  it('centres a single category rather than dividing by zero', () => {
    expect(xPosition(0, 1, 100)).toBe(50)
  })

  it('offsets by a left padding when given one', () => {
    expect(xPosition(0, 3, 100, 40)).toBe(40)
    expect(xPosition(2, 3, 100, 40)).toBe(140)
  })
})

describe('axisTicks', () => {
  it('rounds to nice, evenly-spaced ticks that cover the raw max', () => {
    expect(axisTicks(75)).toEqual([0, 20, 40, 60, 80])
  })

  it('returns a minimal [0, 1] range for a zero or negative max', () => {
    expect(axisTicks(0)).toEqual([0, 1])
    expect(axisTicks(-5)).toEqual([0, 1])
  })
})

describe('thinnedLabelIndexes', () => {
  it('labels every category when the count is at or under the cap', () => {
    expect(thinnedLabelIndexes(4, 6)).toEqual([0, 1, 2, 3])
  })

  it('thins to an even stride above the cap, always keeping the first and last', () => {
    const indexes = thinnedLabelIndexes(30, 6)

    expect(indexes[0]).toBe(0)
    expect(indexes.at(-1)).toBe(29)
    expect(indexes.length).toBeLessThanOrEqual(6)
  })

  it('returns nothing for an empty range', () => {
    expect(thinnedLabelIndexes(0)).toEqual([])
  })
})

describe('maxLabelsForWidth', () => {
  it('allows more labels for a wider chart than a narrower one', () => {
    expect(maxLabelsForWidth(200)).toBeLessThan(maxLabelsForWidth(900))
  })

  it('never drops below 2 labels, even for a very narrow chart', () => {
    expect(maxLabelsForWidth(0)).toBe(2)
    expect(maxLabelsForWidth(60)).toBeGreaterThanOrEqual(2)
  })

  it('caps out rather than growing without bound on a very wide chart', () => {
    expect(maxLabelsForWidth(5000)).toBeLessThanOrEqual(10)
  })
})
