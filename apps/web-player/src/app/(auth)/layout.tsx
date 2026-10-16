import type { PropsWithChildren } from 'react'

/** Sign-in, sign-up and account recovery: full-screen, without the public header and footer. */
export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-background text-foreground">{children}</div>
  )
}
