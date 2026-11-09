import { LanguageSwitcher } from '@features/SwitchLanguage'
import type { ReactNode } from 'react'
import { AuthLogo } from './AuthLogo'

type AuthCardShellProps = {
  children: ReactNode
}

/**
 * Password recovery and email verification: one centred panel; on phones the panel opens up.
 * Centred in the full viewport height from 640px up.
 */
export const AuthCardShell = ({ children }: AuthCardShellProps) => (
  <main className="flex min-h-dvh justify-center px-5 py-5 sm:items-center sm:py-10">
    <div className="flex w-full max-w-110 flex-col gap-5 sm:rounded-[14px] sm:border sm:border-border sm:bg-card sm:p-[23px]">
      <div className="flex items-center justify-between gap-3">
        <AuthLogo />
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  </main>
)
