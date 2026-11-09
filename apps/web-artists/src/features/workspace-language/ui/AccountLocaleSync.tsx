import { useArtistProfile } from '@entities/artist-account'
import { readLocaleCookie, useI18n } from '@shared/i18n'
import { useEffect, useRef } from 'react'
import { accountLocaleToAdopt } from '../model/accountLocale'

/**
 * Switches a device that never chose a language to the one saved on the artist account, once
 * the profile loads. Renders nothing; the switch also saves the choice on the device.
 */
export function AccountLocaleSync({ artistId }: { artistId: string }) {
  const adoptedFor = useRef<string | null>(null)
  const account = useArtistProfile(artistId).data?.locale
  const { locale, setLocale } = useI18n()
  useEffect(() => {
    if (!account || adoptedFor.current === artistId) return
    // Adopt once; a click must not be reverted while the locale cookie is still saving.
    adoptedFor.current = artistId
    const next = accountLocaleToAdopt({
      account,
      current: locale,
      saved: readLocaleCookie(document.cookie),
    })
    if (next) setLocale(next)
  }, [account, artistId, locale, setLocale])
  return null
}
