import { ROUTES } from '@shared/routes'
import { redirect } from 'next/navigation'

/** OAuth callback shim: providers land on /login/2fa, the screen lives at /auth/login/2fa. */
export default function OAuthTwoFactorRedirectPage() {
  redirect(ROUTES.auth.twoFactorLogin)
}
