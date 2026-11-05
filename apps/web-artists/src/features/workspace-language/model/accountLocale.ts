import { isLocale, type Locale } from '@shared/i18n'

interface AccountLocaleInput {
  /** The language stored on the artist account. */
  account: string
  /** The language the workspace shows now. */
  current: Locale
  /** The choice saved on this device, if any. */
  saved: string | undefined
}

/**
 * The account language to switch to, or null. A device that never chose a language follows
 * the account; once a choice is saved on the device, that choice wins there.
 */
export function accountLocaleToAdopt({
  account,
  current,
  saved,
}: AccountLocaleInput): Locale | null {
  if (saved !== undefined || !isLocale(account) || account === current)
    return null
  return account
}
