import { Suspense } from 'react'
import { Spinner } from '@spotify/ui-react'
import { ResetPasswordForm } from '@features/reset-password/ui/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <Suspense fallback={<Spinner />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}