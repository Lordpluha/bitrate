import { describe, expect, it } from 'vitest'
import { createI18n } from './createI18n'

describe('createI18n', () => {
  it('translates a key into the active locale', () => {
    expect(createI18n({ locale: 'uk' }).t('settings.language.title')).toBe(
      'Мова',
    )
  })

  it('fills placeholders', () => {
    expect(
      createI18n({ locale: 'en' }).t('common.pageOf', { page: 2, total: 5 }),
    ).toBe('Page 2 of 5')
  })

  it('chooses the plural form by the locale rules', () => {
    const { tp } = createI18n({ locale: 'uk' })

    expect(tp({ count: 1, key: 'common.tracks' })).toBe('1 трек')
    expect(tp({ count: 3, key: 'common.tracks' })).toBe('3 треки')
    expect(tp({ count: 5, key: 'common.tracks' })).toBe('5 треків')
  })
})
