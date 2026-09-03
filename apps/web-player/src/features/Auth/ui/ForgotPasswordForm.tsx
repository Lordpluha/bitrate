'use client'

import { Button, Input } from '@bitrate/ui-react'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { AuthRecoveryCard } from './AuthRecoveryCard'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const forgotPassword = useMutation('post', '/api/v1/auth/forgot-password', {
    meta: { suppressErrorToast: true },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await forgotPassword.mutateAsync({ body: { email: email.trim() } })
      showApiSuccessToast(
        'If an account exists for this email, a reset link has been sent.',
      )
    } catch (error) {
      showApiErrorToast(error, 'Unable to request a password reset.')
    }
  }

  return (
    <AuthRecoveryCard
      description="Enter the email associated with your account."
      title="Reset your password"
    >
      <form
        aria-busy={forgotPassword.isPending}
        className="grid gap-5"
        onSubmit={handleSubmit}
      >
        <label className="text-sm font-semibold" htmlFor="recovery-email">
          Email address
        </label>
        <Input
          autoComplete="email"
          id="recovery-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
          variant="contrast"
        />
        <Button
          className="rounded"
          disabled={forgotPassword.isPending}
          type="submit"
          variant="primary"
        >
          Send reset link
        </Button>
      </form>
      <Link
        className="text-center text-sm font-bold hover:underline"
        href={ROUTES.auth.login}
      >
        Back to login
      </Link>
    </AuthRecoveryCard>
  )
}
