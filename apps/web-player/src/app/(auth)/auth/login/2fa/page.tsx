import { TwoFactorLoginView } from '@views/TwoFactorLoginView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Two-factor sign-in',
}

export default function TwoFactorLoginPage() {
  return <TwoFactorLoginView />
}
