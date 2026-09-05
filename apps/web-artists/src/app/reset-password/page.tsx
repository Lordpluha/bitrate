import { Spinner } from '@bitrate/ui-react'
import { ResetPasswordForm } from '@features/reset-password/ui/ResetPasswordForm'
import { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <Suspense fallback={<Spinner />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
