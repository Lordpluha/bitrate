import { createI18n } from '@shared/i18n'
import { describe, expect, it } from 'vitest'
import { changeLabel } from './analytics.schema'

const en = createI18n({ locale: 'en' }).t

describe('changeLabel', () => {
  it('signs the rounded change against the previous period', () => {
    expect(changeLabel(150, 100, en)).toBe('+50% vs previous period')
    expect(changeLabel(75, 100, en)).toBe('−25% vs previous period')
  })

  it('names a flat period and a first period instead of a percentage', () => {
    expect(changeLabel(100, 100, en)).toBe('No change')
    expect(changeLabel(0, 0, en)).toBe('No change')
    expect(changeLabel(12, 0, en)).toBe('New this period')
  })

  it('speaks the workspace language', () => {
    expect(changeLabel(150, 100, createI18n({ locale: 'pl' }).t)).toBe(
      '+50% względem poprzedniego okresu',
    )
  })
})
