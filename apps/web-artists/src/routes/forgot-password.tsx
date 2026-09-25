import { ForgotPasswordForm } from '@features/forgot-password/ui/ForgotPasswordForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <ForgotPasswordForm />
    </main>
  )
}
