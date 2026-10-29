import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { ArtistLogo } from '@shared/ui'
import { Link } from '@tanstack/react-router'

export const LandingHeader = () => {
  const { t } = useI18n()
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <ArtistLogo />
        <nav
          aria-label={t('landing.account')}
          className="flex items-center gap-2"
        >
          <Button asChild variant="ghost">
            <Link to={ROUTES.auth.login}>{t('landing.logIn')}</Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.auth.registration}>{t('landing.signUp')}</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
