import { describe, expect, it } from 'vitest'
import { toPascalCase } from './naming.mjs'

describe('toPascalCase', () => {
  it('capitalizes a simple lowercase name', () => {
    expect(toPascalCase('icon.svg')).toBe('Icon')
  })

  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-icon.svg')).toBe('MyIcon')
  })

  it('converts underscore_case to PascalCase', () => {
    expect(toPascalCase('my_icon.svg')).toBe('MyIcon')
  })

  it('keeps already PascalCase names intact', () => {
    expect(toPascalCase('MyIcon.svg')).toBe('MyIcon')
  })

  it('handles multiple separators', () => {
    expect(toPascalCase('my-icon-name.svg')).toBe('MyIconName')
  })

  it('handles mixed separators (dash and underscore)', () => {
    expect(toPascalCase('my-icon_name.svg')).toBe('MyIconName')
  })

  it('handles consecutive separators', () => {
    expect(toPascalCase('my--icon.svg')).toBe('MyIcon')
  })

  it('handles names with digits', () => {
    expect(toPascalCase('icon-16.svg')).toBe('Icon16')
  })

  it('handles names starting with digits', () => {
    expect(toPascalCase('16-icon.svg')).toBe('16Icon')
  })

  it('removes the .svg extension', () => {
    const result = toPascalCase('arrow.svg')
    expect(result).not.toContain('.svg')
  })

  it('handles names with numbers in the middle', () => {
    expect(toPascalCase('icon-24px.svg')).toBe('Icon24px')
  })

  it('handles a single character name', () => {
    expect(toPascalCase('a.svg')).toBe('A')
  })
})
