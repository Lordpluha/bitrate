'use client'

import { Button } from '@bitrate/ui-react'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useMutation } from '@/shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { ROUTES } from '@/shared/routes'
import { AuthHeading } from './AuthHeading'
import { AuthTextInput } from './AuthTextInput'
import { AuthTextLink } from './AuthTextLink'
import { AUTH_BUTTON_CLASS } from './authStyles'

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
    <>
      <AuthHeading
        description={
          token
            ? 'Confirm the email address connected to your account.'
            : 'Check your inbox or request a new verification link.'
        }
        title="Verify your email"
      />

      {token ? (
        <Button
          className={AUTH_BUTTON_CLASS}
          disabled={verifyEmail.isPending}
          onClick={() => void handleVerify()}
          type="button"
          variant="primary"
        >
          {verifyEmail.isPending ? 'Verifying...' : 'Verify email'}
        </Button>
      ) : null}

      <form className="flex flex-col gap-5" onSubmit={handleResend}>
        <AuthTextInput
          autoComplete="email"
          id="verification-email"
          label="Email address"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <Button
          className={AUTH_BUTTON_CLASS}
          disabled={resendVerification.isPending}
          type="submit"
          variant="secondary"
        >
          Resend verification email
        </Button>
      </form>

      <AuthTextLink href={ROUTES.auth.login}>Back to login</AuthTextLink>
    </>
  )
}
