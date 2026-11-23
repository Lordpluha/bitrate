import { ForgotPasswordView } from '@views/AuthRecovery'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
