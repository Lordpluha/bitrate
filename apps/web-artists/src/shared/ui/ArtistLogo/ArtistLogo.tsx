import { LogoIcon } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Link } from '@tanstack/react-router'

export const ArtistLogo = () => {
  const { t } = useI18n()
  return (
    <Link aria-label={t('landing.home')} to="/">
      <LogoIcon height={36} width={36} />
    </Link>
  )
}
