'use client'

import { useMutation } from '@shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { Button, Input, LogoIcon, PasswordInput } from '@spotify/ui-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, type ReactNode, useState } from 'react'

const AuthRecoveryCard = ({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) => (
  <section className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-lg bg-contrast px-8 py-10 text-text-contrast shadow-2xl max-sm:px-5">
    <div className="flex flex-col items-center text-center">
      <LogoIcon height={64} width={64} />
      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-grey-500">{description}</p>
    </div>
    {children}
  </section>
)

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
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label
          className="grid gap-2 text-sm font-semibold"
          htmlFor="recovery-email"
        >
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

export const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const resetPassword = useMutation('post', '/api/v1/auth/reset-password', {
    meta: { suppressErrorToast: true },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      showApiErrorToast(new Error('The password reset link is invalid.'))
      return
    }

    if (password.length < 8) {
      showApiErrorToast(
        new Error('Password must contain at least 8 characters.'),
      )
      return
    }

    if (password !== confirmPassword) {
      showApiErrorToast(new Error('Passwords do not match.'))
      return
    }

    try {
      await resetPassword.mutateAsync({ body: { password, token } })
      showApiSuccessToast('Password updated. You can now log in.')
      router.replace(ROUTES.auth.login)
    } catch (error) {
      showApiErrorToast(error, 'Unable to reset the password.')
    }
  }

  return (
    <AuthRecoveryCard
      description="Choose a new password for your account."
      title="Create a new password"
    >
      {token ? (
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label
            className="grid gap-2 text-sm font-semibold"
            htmlFor="new-password"
          >
            New password
          </label>
          <PasswordInput
            autoComplete="new-password"
            id="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            value={password}
            variant="contrast"
          />
          <label
            className="grid gap-2 text-sm font-semibold"
            htmlFor="confirm-new-password"
          >
            Confirm new password
          </label>
          <PasswordInput
            autoComplete="new-password"
            id="confirm-new-password"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            value={confirmPassword}
            variant="contrast"
          />
          <Button
            className="rounded"
            disabled={resetPassword.isPending}
            type="submit"
            variant="primary"
          >
            Update password
          </Button>
        </form>
      ) : (
        <div className="rounded bg-surface p-4 text-sm text-text-subdued">
          This password reset link is missing its token. Request a new link and
          try again.
        </div>
      )}
      <Link
        className="text-center text-sm font-bold hover:underline"
        href={ROUTES.auth.forgotPassword}
      >
        Request another link
      </Link>
    </AuthRecoveryCard>
  )
}
