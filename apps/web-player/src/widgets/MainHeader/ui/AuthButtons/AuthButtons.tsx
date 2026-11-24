'use client'

import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

/**
 * Sign up / Log in for a visitor without a session: links to the designed full-screen auth
 * pages, the same destinations as the landing header.
 */
export const AuthButtons = () => {
  const { t } = useI18n()

  return (
    <div className="flex items-center xl:gap-8 flex-row space-y-4 xl:space-y-0">
      <Button
        asChild
        className="text-base font-semibold text-foreground xl:justify-center justify-start py-3 rounded-full h-12 min-w-25"
        variant="ghost"
      >
        <Link href={ROUTES.auth.registration}>{t('auth.signUp')}</Link>
      </Button>

      <Button
        asChild
        className="px-8 py-3 rounded-full font-bold text-base h-12 min-w-25 xl:justify-center justify-start"
        variant="default"
      >
        <Link href={ROUTES.auth.login}>{t('profile.logIn')}</Link>
      </Button>
    </div>
  )
}
