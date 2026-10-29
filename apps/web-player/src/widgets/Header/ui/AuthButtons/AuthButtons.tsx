import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

/** The same Sign up / Log in pair as the player header, as links to the auth pages. */
export const AuthButtons = () => {
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-2 xl:gap-4">
      <Button
        asChild
        className="h-12 min-w-25 rounded-full text-base font-semibold"
        variant="ghost"
      >
        <Link href={ROUTES.auth.registration}>{t('auth.signUp')}</Link>
      </Button>
      <Button
        asChild
        className="h-12 min-w-25 rounded-full px-8 text-base font-bold"
        variant="default"
      >
        <Link href={ROUTES.auth.login}>{t('profile.logIn')}</Link>
      </Button>
    </div>
  )
}
