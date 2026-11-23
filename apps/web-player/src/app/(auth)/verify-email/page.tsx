import { VerifyEmailView } from '@views/AuthRecovery'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Verify email',
}

export default function VerifyEmailPage() {
  /* VerifyEmailForm reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <VerifyEmailView />
    </Suspense>
  )
}
