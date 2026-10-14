import { VerifyEmailForm } from '@features/Auth'
import { Suspense } from 'react'

export default function VerifyEmailPage() {
  /* VerifyEmailForm reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}
