import { RegistrationView } from '@views/RegistrationView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign up',
}

export default function RegistrationPage() {
  return <RegistrationView />
}
