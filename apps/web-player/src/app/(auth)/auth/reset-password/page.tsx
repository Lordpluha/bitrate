import { ResetPasswordView } from '@views/AuthRecovery'
import { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  )
}
