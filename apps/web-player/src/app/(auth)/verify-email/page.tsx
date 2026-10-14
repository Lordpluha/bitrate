import { VerifyEmailView } from '@views/AuthRecovery'
import { Suspense } from 'react'

export default function VerifyEmailPage() {
  /* VerifyEmailForm reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <VerifyEmailView />
    </Suspense>
  )
}
