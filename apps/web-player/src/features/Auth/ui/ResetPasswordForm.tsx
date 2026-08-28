'use client'

import { useMutation } from '@shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { Button, PasswordInput } from '@spotify/ui-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { AuthRecoveryCard } from './AuthRecoveryCard'

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

    if (!token) return showApiErrorToast(new Error('Invalid reset link.'))
    if (password.length < 8) {
      return showApiErrorToast(
        new Error('Password must contain at least 8 characters.'),
      )
    }
    if (password !== confirmPassword) {
      return showApiErrorToast(new Error('Passwords do not match.'))
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
        <form
          aria-busy={resetPassword.isPending}
          className="grid gap-5"
          onSubmit={handleSubmit}
        >
          <label className="text-sm font-semibold" htmlFor="new-password">
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
            className="text-sm font-semibold"
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
        <div
          aria-live="polite"
          className="rounded bg-surface p-4 text-sm text-text-subdued"
        >
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
