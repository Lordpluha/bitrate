import { describe, expect, it } from 'vitest'
import { sectionFor } from './current-crumb'
import { shortcutHint } from './top-bar'

describe('sectionFor', () => {
  it('names a detail page by the section it belongs to', () => {
    expect(sectionFor('/moderation/R-1042')?.label).toBe('nav.moderation')
  })

  it('ignores the query and the fragment', () => {
    expect(sectionFor('/users?status=all#top')?.label).toBe('nav.users')
  })

  /** Every path starts with `/` — matching it by prefix would call every page "Overview". */
  it('treats Overview as an exact match only', () => {
    expect(sectionFor('/')?.label).toBe('nav.overview')
    expect(sectionFor('/moderation')?.label).toBe('nav.moderation')
  })

  it('does not match a section by a shared word prefix', () => {
    expect(sectionFor('/rolesy')).toBeUndefined()
  })

  it('has no section for an unknown address', () => {
    expect(sectionFor('/no-such-page')).toBeUndefined()
  })
})

describe('shortcutHint', () => {
  it('names ⌘ on Apple keyboards', () => {
    expect(shortcutHint('MacIntel')).toBe('⌘K')
    expect(shortcutHint('iPhone')).toBe('⌘K')
  })

  it('names Ctrl everywhere else', () => {
    expect(shortcutHint('Linux x86_64')).toBe('Ctrl K')
    expect(shortcutHint('')).toBe('Ctrl K')
  })
})
