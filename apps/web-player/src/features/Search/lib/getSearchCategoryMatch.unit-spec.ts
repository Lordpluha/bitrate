import { describe, expect, it } from 'vitest'
import { matchBrowseCategory } from './getSearchCategoryMatch'

const categories = [
  { name: 'Hip-Hop', slug: 'hip-hop' },
  { name: 'House', slug: 'house' },
  { name: 'Lo-fi Beats', slug: 'lo-fi-beats' },
]

describe('matchBrowseCategory', () => {
  it('matches a category by its name, ignoring case', () => {
    expect(matchBrowseCategory({ query: 'house', categories })?.slug).toBe(
      'house',
    )
    expect(matchBrowseCategory({ query: 'LO-FI', categories })?.slug).toBe(
      'lo-fi-beats',
    )
  })

  it('matches a query that contains the category name', () => {
    expect(
      matchBrowseCategory({ query: 'deep house mix', categories })?.slug,
    ).toBe('house')
  })

  it('matches by slug', () => {
    expect(matchBrowseCategory({ query: 'hip-hop', categories })?.name).toBe(
      'Hip-Hop',
    )
  })

  it('returns nothing for an unrelated query or before categories load', () => {
    expect(
      matchBrowseCategory({ query: 'netflix', categories }),
    ).toBeUndefined()
    expect(
      matchBrowseCategory({ query: 'house', categories: [] }),
    ).toBeUndefined()
    expect(matchBrowseCategory({ query: '  ', categories })).toBeUndefined()
  })
})
