import { describe, expect, it } from 'vitest'
import { countriesFor, countryName } from './countries'

describe('countries', () => {
  it('names a country in the workspace language', () => {
    expect(countryName('UA', 'uk')).toBe('Україна')
    expect(countryName('DE', 'pl')).toBe('Niemcy')
    expect(countryName('PL', 'en')).toBe('Poland')
  })

  it('sorts the list by the names in that language', () => {
    const names = countriesFor('uk').map((country) => country.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'uk')))
    expect(
      countriesFor('uk').find((country) => country.code === 'PL')?.name,
    ).toBe('Польща')
  })
})
