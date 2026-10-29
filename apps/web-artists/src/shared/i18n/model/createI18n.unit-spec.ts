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

  it('translates a message that is a catalog key, as a form schema stores it', () => {
    expect(
      createI18n({ locale: 'pl' }).tMessage('settings.language.title'),
    ).toBe('Język')
  })

  it('passes through a message that is not a catalog key, such as an API error', () => {
    expect(createI18n({ locale: 'uk' }).tMessage('Username is taken')).toBe(
      'Username is taken',
    )
  })

  it('chooses the plural form by the locale rules', () => {
    const { tp } = createI18n({ locale: 'uk' })

    expect(tp({ count: 1, key: 'common.tracks' })).toBe('1 трек')
    expect(tp({ count: 3, key: 'common.tracks' })).toBe('3 треки')
    expect(tp({ count: 5, key: 'common.tracks' })).toBe('5 треків')
  })
})
