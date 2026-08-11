'use client'

import { Button, Input } from '@spotify/ui-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useMutation } from '@/shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { ROUTES } from '@/shared/routes'
import { AuthRecoveryCard } from './AuthRecoveryCard'

export const VerifyEmailForm = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [email, setEmail] = useState(searchParams.get('email')?.trim() ?? '')
  const verifyEmail = useMutation('post', '/api/v1/auth/verify-email', {
    meta: { suppressErrorToast: true },
  })
  const resendVerification = useMutation(
    'post',
    '/api/v1/auth/verify-email/resend',
    { meta: { suppressErrorToast: true } },
  )

  const handleVerify = async () => {
    if (!token) return

    try {
      await verifyEmail.mutateAsync({ body: { token } })
      showApiSuccessToast('Your email has been verified. You can now log in.')
    } catch (error) {
      showApiErrorToast(error, 'This verification link is invalid or expired.')
    }
  }

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await resendVerification.mutateAsync({ body: { email: email.trim() } })
      showApiSuccessToast(
        'If the account needs verification, a new email has been sent.',
      )
    } catch (error) {
      showApiErrorToast(error, 'Could not resend the verification email.')
    }
  }

  return (
    <AuthRecoveryCard
      description={
        token
          ? 'Confirm the email address connected to your account.'
          : 'Check your inbox or request a new verification link.'
      }
      title="Verify your email"
    >
      {token && (
        <Button
          className="rounded"
          disabled={verifyEmail.isPending}
          onClick={() => void handleVerify()}
          type="button"
          variant="primary"
        >
          {verifyEmail.isPending ? 'Verifying...' : 'Verify email'}
        </Button>
      )}

      <form className="grid gap-4" onSubmit={handleResend}>
        <label className="text-sm font-semibold" htmlFor="verification-email">
          Email address
        </label>
        <Input
          autoComplete="email"
          id="verification-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
          variant="contrast"
        />
        <Button
          className="rounded"
          disabled={resendVerification.isPending}
          type="submit"
          variant="secondary"
        >
          Resend verification email
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
