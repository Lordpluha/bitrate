import { redirect } from 'next/navigation'

export default function OAuthTwoFactorRedirectPage() {
  redirect('/auth/login/2fa')
}
