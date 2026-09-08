import { Spinner } from '@bitrate/ui-react'
import { ResetPasswordForm } from '@features/reset-password/ui/ResetPasswordForm'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <Suspense fallback={<Spinner />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
