import { resolveTokenValue } from './resolve-token-value'

describe('resolveTokenValue', () => {
  const vars = {
    'color-purple-500': '#7c3aed',
    'color-primary': 'var(--color-purple-500)',
    'color-ring': 'var(--color-primary)',
    'color-black': '#000000',
    'color-a': 'var(--color-b)',
    'color-b': 'var(--color-a)',
  }

  it('follows a var() chain to the palette value', () => {
    expect(resolveTokenValue('var(--color-ring)', vars)).toBe('#7c3aed')
  })

  it('flattens a color-mix with transparent into rgba', () => {
    expect(resolveTokenValue('color-mix(in srgb, var(--color-black) 40%, transparent)', vars)).toBe(
      'rgba(0, 0, 0, 0.4)',
    )
  })

  it('keeps a literal value as is', () => {
    expect(resolveTokenValue('rgba(255, 255, 255, 0.1)', vars)).toBe('rgba(255, 255, 255, 0.1)')
  })

  it('throws on an unknown token instead of shipping a broken colour', () => {
    expect(() => resolveTokenValue('var(--color-missing)', vars)).toThrow('Unknown token --color-missing')
  })

  it('throws on a reference cycle', () => {
    expect(() => resolveTokenValue('var(--color-a)', vars)).toThrow('cycle')
  })
})
