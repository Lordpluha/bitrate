import { describe, expect, it } from 'vitest'
import { accountLocaleToAdopt } from './accountLocale'

describe('accountLocaleToAdopt', () => {
  it('adopts the account language on a device that never chose one', () => {
    expect(
      accountLocaleToAdopt({ account: 'uk', current: 'en', saved: undefined }),
    ).toBe('uk')
  })

  it('keeps a choice already made on this device', () => {
    expect(
      accountLocaleToAdopt({ account: 'uk', current: 'pl', saved: 'pl' }),
    ).toBeNull()
  })

  it('does nothing when the workspace already speaks it', () => {
    expect(
      accountLocaleToAdopt({ account: 'pl', current: 'pl', saved: undefined }),
    ).toBeNull()
  })

  it('ignores a language the workspace does not ship', () => {
    expect(
      accountLocaleToAdopt({ account: 'de', current: 'en', saved: undefined }),
    ).toBeNull()
  })
})
