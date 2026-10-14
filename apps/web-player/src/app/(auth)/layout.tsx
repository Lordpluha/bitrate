import { brandFontVariables } from '@shared/fonts'
import type { PropsWithChildren } from 'react'

/**
 * Sign-in, sign-up and account recovery: full-screen, without the public header and footer.
 * The app's base rule sets every element to `--font-source-sans`; pointing it at Inter here
 * gives the auth screens the brand text face.
 */
export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div
      className={`${brandFontVariables} min-h-dvh bg-background text-foreground [--font-source-sans:var(--font-landing-body)]`}
    >
      {children}
    </div>
  )
}
