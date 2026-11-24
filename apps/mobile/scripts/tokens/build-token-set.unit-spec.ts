import { readFileSync } from 'node:fs'

import { buildTokenSet } from './build-token-set'
import { OUTPUT_FILE, TOKENS_DIR } from './generate-tokens'
import { renderTokensModule } from './render-tokens-module'

describe('buildTokenSet', () => {
  const tokens = buildTokenSet(TOKENS_DIR)

  it('uses the @theme values as the dark default', () => {
    expect(tokens.themes.dark.background).toBe('#0b0d12')
    expect(tokens.themes.dark.primary).toBe('#7c3aed')
  })

  it('overrides roles in light and inherits nothing dark-only there', () => {
    expect(tokens.themes.light.background).toBe('#ffffff')
    expect(tokens.themes.light.text).toBe('#2a3038')
  })

  it('layers dim on the dark defaults like the browser cascade', () => {
    expect(tokens.themes.dim.background).toBe('#0e1117')
    expect(tokens.themes.dim.surface).toBe(tokens.themes.dark.surface)
  })

  it('converts rem scales into points', () => {
    expect(tokens.spacing['4']).toBe(16)
    expect(tokens.radius.xl).toBe(12)
    expect(tokens.fontSize.base).toBe(16)
  })

  it('matches the committed generated module', () => {
    expect(readFileSync(OUTPUT_FILE, 'utf8')).toBe(renderTokensModule(tokens))
  })
})
