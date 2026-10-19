import type { ReactNode } from 'react'
import { AuthLogo } from './AuthLogo'

type AuthCardShellProps = {
  children: ReactNode
}

/**
 * Password recovery and email verification: one centred panel; on phones the panel opens up.
 * Centred like the design, above the 76px strip it keeps free at the bottom.
 */
export const AuthCardShell = ({ children }: AuthCardShellProps) => (
  <main className="flex min-h-dvh justify-center px-5 py-5 sm:items-center sm:pt-0 sm:pb-19">
    <div className="flex w-full max-w-110 flex-col gap-5 sm:rounded-[14px] sm:border sm:border-border sm:bg-card sm:p-[23px]">
      <AuthLogo />
      {children}
    </div>
  </main>
)
