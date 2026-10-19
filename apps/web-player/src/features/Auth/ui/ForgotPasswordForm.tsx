'use client'

import { Button } from '@bitrate/ui-react'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { z } from 'zod'
import { AuthAlert } from './AuthAlert'
import { AuthHeading } from './AuthHeading'
import { AuthTextInput } from './AuthTextInput'
import { AuthTextLink } from './AuthTextLink'
import { AUTH_BUTTON_CLASS } from './authStyles'

const emailSchema = z.email()

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)
  const forgotPassword = useMutation('post', '/api/v1/auth/forgot-password', {
    meta: { suppressErrorToast: true },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextEmail = email.trim()
    if (!emailSchema.safeParse(nextEmail).success) {
      setEmailError('Enter a valid email address')
      return
    }

    try {
      await forgotPassword.mutateAsync({ body: { email: nextEmail } })
      setIsSent(true)
    } catch (error) {
      showApiErrorToast(error, 'Unable to request a password reset.')
    }
  }

  return (
    <>
      <AuthHeading
        description={
          emailError
            ? undefined
            : 'Enter the email associated with your account.'
        }
        title="Reset your password"
      />
      {isSent ? (
        <>
          <AuthAlert title="Check your inbox">
            If an account exists for this email, a reset link has been sent.
          </AuthAlert>
          <Button asChild className={AUTH_BUTTON_CLASS} variant="outline">
            <Link href={ROUTES.auth.login}>Back to login</Link>
          </Button>
        </>
      ) : (
        <>
          <form
            aria-busy={forgotPassword.isPending}
            className="flex flex-col gap-5"
            noValidate
            onSubmit={handleSubmit}
          >
            <AuthTextInput
              autoComplete="email"
              error={emailError}
              id="recovery-email"
              label="Email address"
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError(null)
              }}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            <Button
              className={AUTH_BUTTON_CLASS}
              disabled={forgotPassword.isPending}
              type="submit"
              variant="primary"
            >
              {forgotPassword.isPending ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
          {emailError ? null : (
            <AuthTextLink href={ROUTES.auth.login}>Back to login</AuthTextLink>
          )}
        </>
      )}
    </>
  )
}
