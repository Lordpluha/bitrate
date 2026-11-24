import { createTranslator } from './create-translator'
import { matchLocale } from './locales'
import { en } from './messages/en'
import { pl } from './messages/pl'
import { uk } from './messages/uk'

describe('createTranslator', () => {
  it('fills placeholders', () => {
    expect(createTranslator('en')('home.greeting.morning', { name: 'Ann' })).toBe('Good morning, Ann')
  })

  it('translates into the chosen locale', () => {
    expect(createTranslator('uk')('nav.search')).toBe('Пошук')
  })

  it('keeps an unknown placeholder visible', () => {
    expect(createTranslator('en')('home.greeting.morning')).toBe('Good morning, {name}')
  })
})

describe('matchLocale', () => {
  it.each([
    ['uk-UA', 'uk'],
    ['pl', 'pl'],
    ['de-DE', 'en'],
    [undefined, 'en'],
  ])('maps %s to %s', (tag, expected) => {
    expect(matchLocale(tag)).toBe(expected)
  })
})

describe('catalogs', () => {
  it('give every locale the same keys as English', () => {
    const keys = Object.keys(en).sort()
    expect(Object.keys(uk).sort()).toEqual(keys)
    expect(Object.keys(pl).sort()).toEqual(keys)
  })
})
