import { useArtistProfile } from '@entities/artist-account'
import { readLocaleCookie, useI18n } from '@shared/i18n'
import { useEffect } from 'react'
import { accountLocaleToAdopt } from '../model/accountLocale'

/**
 * Switches a device that never chose a language to the one saved on the artist account, once
 * the profile loads. Renders nothing; the switch also saves the choice on the device.
 */
export function AccountLocaleSync({ artistId }: { artistId: string }) {
  const account = useArtistProfile(artistId).data?.locale
  const { locale, setLocale } = useI18n()
  useEffect(() => {
    if (!account) return
    const next = accountLocaleToAdopt({
      account,
      current: locale,
      saved: readLocaleCookie(document.cookie),
    })
    if (next) setLocale(next)
  }, [account, locale, setLocale])
  return null
}
