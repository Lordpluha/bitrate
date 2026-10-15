import type { ReactNode } from 'react'
import { AuthLogo } from './AuthLogo'

type AuthSplitShellProps = {
  children: ReactNode
  /** The large line on the brand panel, e.g. "One more step." on the 2FA step. */
  headline: string
}

/**
 * Sign-in, 2FA and sign-up: the brand panel on the left from 1024px up, the form on the right.
 * As in the design, the panel stops 76px above the bottom of the screen.
 * Phones get the logo above the form instead of the panel. The form is centred above the
 * 76px strip the design keeps free at the bottom.
 */
export const AuthSplitShell = ({ children, headline }: AuthSplitShellProps) => (
  <div className="flex min-h-dvh">
    <aside className="sticky top-0 hidden h-[calc(100dvh-76px)] self-start w-[44%] shrink-0 xl:w-160 flex-col justify-between bg-[url(/images/auth/night-signal.webp)] bg-cover bg-center p-12 lg:flex">
      <AuthLogo size="panel" />
      <div className="flex flex-col gap-3">
        <p className="max-w-115 font-[family-name:var(--font-landing-display)] text-[44px] font-semibold leading-[1.05] tracking-[-0.6px] text-white">
          {headline}
        </p>
        <p className="text-base leading-[1.2] text-neutral-200">
          Listen, save and return to your library from the browser.
        </p>
      </div>
    </aside>
    <main className="flex flex-1 justify-center px-5 py-5 lg:items-center lg:px-10 lg:pt-0 lg:pb-19">
      <div className="flex w-full max-w-100 flex-col gap-5.5">
        <AuthLogo className="lg:hidden" />
        {children}
      </div>
    </main>
  </div>
)
