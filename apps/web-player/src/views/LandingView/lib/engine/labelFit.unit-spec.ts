import { describe, expect, it } from 'vitest'
import { fitLabel } from './labelFit'

/** The label's widest line at a font size, with the same per-character estimate. */
const widest = (label: string, font: number) =>
  Math.max(...label.split(' ').map((w) => w.length)) * font * 0.62

describe('fitLabel', () => {
  it('keeps the designed size when the label already fits', () => {
    expect(fitLabel({ label: 'GSAP', r: 40, base: 12 })).toBe(12)
  })

  it('shrinks a long word until it fits inside the bubble', () => {
    const font = fitLabel({ label: 'Docusaurus', r: 33, base: 12 })
    expect(font).toBeLessThan(12)
    expect(widest('Docusaurus', font)).toBeLessThanOrEqual(2 * 33 * 0.78)
  })

  it('wraps at spaces, so a two-word label is sized by its longer word', () => {
    expect(fitLabel({ label: 'TanStack Start', r: 45, base: 12 })).toBe(
      fitLabel({ label: 'TanStack', r: 45, base: 12 }),
    )
  })

  it('never goes below a readable minimum', () => {
    expect(fitLabel({ label: 'Supercalifragilistic', r: 10, base: 12 })).toBe(7)
  })
})
