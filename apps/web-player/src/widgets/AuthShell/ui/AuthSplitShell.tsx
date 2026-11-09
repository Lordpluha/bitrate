'use client'

import { LanguageSwitcher } from '@features/SwitchLanguage'
import { type TranslationKey, useI18n } from '@shared/i18n'
import type { ReactNode } from 'react'
import { AuthLogo } from './AuthLogo'

type AuthSplitShellProps = {
  children: ReactNode
  /** The large line on the brand panel, e.g. "One more step." on the 2FA step. */
  headlineKey: TranslationKey
}

/**
 * Sign-in, 2FA and sign-up: the brand panel on the left from 1024px up, the form on the right.
 * Both columns fill the whole viewport height: the panel stays pinned while a long form
 * scrolls, and the form is centred in the full height. Phones get the logo above the form
 * instead of the panel and scroll the page as usual.
 */
export const AuthSplitShell = ({
  children,
  headlineKey,
}: AuthSplitShellProps) => {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh self-start w-[44%] shrink-0 xl:w-160 flex-col justify-between bg-[url(/images/auth/night-signal.webp)] bg-cover bg-center p-12 lg:flex">
        <AuthLogo size="panel" />
        <div className="flex flex-col gap-3">
          <p className="max-w-115 font-[family-name:var(--font-landing-display)] text-[44px] font-semibold leading-[1.05] tracking-[-0.6px] text-white">
            {t(headlineKey)}
          </p>
          <p className="text-base leading-[1.2] text-neutral-200">
            {t('auth.shell.tagline')}
          </p>
        </div>
      </aside>
      <main className="flex flex-1 justify-center px-5 py-5 lg:items-center lg:px-10 lg:py-10">
        <div className="flex w-full max-w-100 flex-col gap-5.5">
          <div className="flex items-center justify-between gap-3">
            <AuthLogo className="lg:hidden" />
            <LanguageSwitcher className="ml-auto" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
