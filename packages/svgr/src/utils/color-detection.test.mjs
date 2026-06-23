import { describe, expect, it } from 'vitest'
import {
  createColorVariableMapping,
  extractColors,
  extractColorsWithMapping,
  extractColorsWithOriginals,
  isMonochrome,
} from './color-detection.mjs'

const svgWithFill = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#ff0000" d="M12 2z"/>
</svg>`

const svgWithStroke = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path stroke="#0000ff" d="M12 2z"/>
</svg>`

const svgMulticolor = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle fill="#ff0000" cx="12" cy="12" r="10"/>
  <path fill="#0000ff" d="M12 2v20"/>
</svg>`

const svgWithInlineStyle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path style="fill: #00ff00; stroke: #ff00ff" d="M12 2z"/>
</svg>`

const svgWithNone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="none" stroke="transparent" d="M12 2z"/>
</svg>`

const svgWithUrl = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="url(#gradient)" d="M12 2z"/>
</svg>`

const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#000000" d="M12 2z"/>
</svg>`

const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#ffffff" d="M12 2z"/>
</svg>`

const svgWithGradient = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="g1">
      <stop stop-color="#aabbcc"/>
      <stop offset="1" stop-color="#112233"/>
    </linearGradient>
  </defs>
  <path fill="url(#g1)" d="M12 2z"/>
</svg>`

const svgWithGradientStyle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="g2">
      <stop style="stop-color: #445566"/>
    </linearGradient>
  </defs>
</svg>`

const svgWithNamedColor = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="red" d="M12 2z"/>
</svg>`

const svgWithShortHex = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#f00" d="M12 2z"/>
</svg>`

const svgWithRgb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="rgb(255, 0, 0)" d="M12 2z"/>
</svg>`

const svgWithHsl = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="hsl(0, 100%, 50%)" d="M12 2z"/>
</svg>`

describe('extractColors', () => {
  it('extracts fill colors as hex', () => {
    const colors = extractColors(svgWithFill)
    expect(colors.has('#ff0000')).toBe(true)
  })

  it('extracts stroke colors as hex', () => {
    const colors = extractColors(svgWithStroke)
    expect(colors.has('#0000ff')).toBe(true)
  })

  it('extracts multiple colors', () => {
    const colors = extractColors(svgMulticolor)
    expect(colors.size).toBe(2)
    expect(colors.has('#ff0000')).toBe(true)
    expect(colors.has('#0000ff')).toBe(true)
  })

  it('extracts colors from inline style fill', () => {
    const colors = extractColors(svgWithInlineStyle)
    expect(colors.has('#00ff00')).toBe(true)
  })

  it('extracts colors from inline style stroke', () => {
    const colors = extractColors(svgWithInlineStyle)
    expect(colors.has('#ff00ff')).toBe(true)
  })

  it('excludes fill="none"', () => {
    const colors = extractColors(svgWithNone)
    expect(colors.size).toBe(0)
  })

  it('excludes fill="transparent"', () => {
    const colors = extractColors(svgWithNone)
    expect(colors.size).toBe(0)
  })

  it('excludes url(...) fills', () => {
    const colors = extractColors(svgWithUrl)
    expect(colors.size).toBe(0)
  })

  it('extracts gradient stop-color attributes', () => {
    const colors = extractColors(svgWithGradient)
    expect(colors.has('#aabbcc')).toBe(true)
    expect(colors.has('#112233')).toBe(true)
  })

  it('extracts gradient stop-color from inline style', () => {
    const colors = extractColors(svgWithGradientStyle)
    expect(colors.has('#445566')).toBe(true)
  })

  it('converts named colors to hex', () => {
    const colors = extractColors(svgWithNamedColor)
    expect(colors.has('#ff0000')).toBe(true)
  })

  it('converts short hex (#f00) to full hex (#ff0000)', () => {
    const colors = extractColors(svgWithShortHex)
    expect(colors.has('#ff0000')).toBe(true)
  })

  it('converts rgb() to hex', () => {
    const colors = extractColors(svgWithRgb)
    expect(colors.has('#ff0000')).toBe(true)
  })

  it('converts hsl() to hex', () => {
    const colors = extractColors(svgWithHsl)
    expect(colors.has('#ff0000')).toBe(true)
  })

  it('returns empty set for svg with no color attributes', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2z"/></svg>`
    const colors = extractColors(svg)
    expect(colors.size).toBe(0)
  })

  it('deduplicates same color appearing multiple times', () => {
    const svg = `<svg><path fill="#ff0000"/><circle fill="#ff0000"/></svg>`
    const colors = extractColors(svg)
    expect(colors.size).toBe(1)
  })
})

describe('extractColorsWithOriginals', () => {
  it('returns a Map with hex -> original value', () => {
    const map = extractColorsWithOriginals(svgWithFill)
    expect(map instanceof Map).toBe(true)
    expect(map.has('#ff0000')).toBe(true)
    expect(map.get('#ff0000')).toBe('#ff0000')
  })

  it('stores the original value for short hex', () => {
    const map = extractColorsWithOriginals(svgWithShortHex)
    expect(map.has('#ff0000')).toBe(true)
    expect(map.get('#ff0000')).toBe('#f00')
  })

  it('stores the original named color value', () => {
    const map = extractColorsWithOriginals(svgWithNamedColor)
    expect(map.has('#ff0000')).toBe(true)
    expect(map.get('#ff0000')).toBe('red')
  })

  it('does not overwrite an existing hex key (first occurrence wins)', () => {
    const svg = `<svg><path fill="#f00"/><circle fill="red"/></svg>`
    const map = extractColorsWithOriginals(svg)
    expect(map.size).toBe(1)
    expect(map.get('#ff0000')).toBe('#f00')
  })
})

describe('isMonochrome', () => {
  it('returns true when there are no colors', () => {
    const svg = `<svg><path d="M0 0"/></svg>`
    expect(isMonochrome(svg)).toBe(true)
  })

  it('returns true for single black (#000000)', () => {
    expect(isMonochrome(svgBlack)).toBe(true)
  })

  it('returns true for single white (#ffffff)', () => {
    expect(isMonochrome(svgWhite)).toBe(true)
  })

  it('returns false for single non-black/white color', () => {
    expect(isMonochrome(svgWithFill)).toBe(false)
  })

  it('returns false for multiple colors', () => {
    expect(isMonochrome(svgMulticolor)).toBe(false)
  })
})

describe('createColorVariableMapping', () => {
  it('maps colors to provided var names', () => {
    const colors = new Set(['#ff0000', '#0000ff'])
    const mapping = createColorVariableMapping(colors, ['primaryColor', 'secondaryColor'])
    expect(mapping.get('#ff0000')).toBe('primaryColor')
    expect(mapping.get('#0000ff')).toBe('secondaryColor')
  })

  it('auto-generates var names when none provided', () => {
    const colors = new Set(['#ff0000', '#0000ff'])
    const mapping = createColorVariableMapping(colors)
    expect(mapping.get('#ff0000')).toBe('color1')
    expect(mapping.get('#0000ff')).toBe('color2')
  })

  it('falls back to auto-generated name when provided list is shorter', () => {
    const colors = new Set(['#ff0000', '#0000ff', '#00ff00'])
    const mapping = createColorVariableMapping(colors, ['primary'])
    expect(mapping.get('#ff0000')).toBe('primary')
    expect(mapping.get('#0000ff')).toBe('color2')
    expect(mapping.get('#00ff00')).toBe('color3')
  })

  it('returns an empty Map for empty color set', () => {
    const mapping = createColorVariableMapping(new Set())
    expect(mapping.size).toBe(0)
  })
})

describe('extractColorsWithMapping', () => {
  it('returns colors, mapping, and originals', () => {
    const result = extractColorsWithMapping(svgMulticolor, ['primary', 'secondary'])
    expect(result.colors).toBeInstanceOf(Set)
    expect(result.mapping).toBeInstanceOf(Map)
    expect(result.originals).toBeInstanceOf(Map)
  })

  it('colors set has the correct hex values', () => {
    const { colors } = extractColorsWithMapping(svgMulticolor)
    expect(colors.has('#ff0000')).toBe(true)
    expect(colors.has('#0000ff')).toBe(true)
  })

  it('mapping links hex colors to provided var names', () => {
    const { mapping } = extractColorsWithMapping(svgMulticolor, ['primary', 'secondary'])
    const values = Array.from(mapping.values())
    expect(values).toContain('primary')
    expect(values).toContain('secondary')
  })

  it('originals map stores original color representations', () => {
    const { originals } = extractColorsWithMapping(svgWithShortHex)
    expect(originals.get('#ff0000')).toBe('#f00')
  })
})
