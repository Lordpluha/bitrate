import { describe, expect, it } from 'vitest'
import { pickPalette } from './palette'

const pixel = (r: number, g: number, b: number, a = 255) => [r, g, b, a]

describe('pickPalette', () => {
  it('orders colours by how much vivid area they cover', () => {
    const pixels = [
      ...pixel(240, 40, 40),
      ...pixel(240, 40, 40),
      ...pixel(240, 40, 40),
      ...pixel(40, 80, 240),
    ]
    expect(pickPalette(pixels, 2)).toEqual(['rgb(240 40 40)', 'rgb(40 80 240)'])
  })

  it('ignores grey, near-black, near-white and transparent pixels', () => {
    const pixels = [
      ...pixel(128, 128, 128),
      ...pixel(10, 5, 5),
      ...pixel(252, 250, 255),
      ...pixel(240, 40, 40, 0),
    ]
    expect(pickPalette(pixels)).toEqual([])
  })

  it('averages the pixels within one hue', () => {
    expect(
      pickPalette([...pixel(200, 40, 40), ...pixel(220, 60, 60)], 1),
    ).toEqual(['rgb(210 50 50)'])
  })
})
