import { ResetPasswordForm } from '@features/Auth'
import { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
