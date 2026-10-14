'use client'

import { Button } from '@bitrate/ui-react'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { AuthAlert } from './AuthAlert'
import { AuthHeading } from './AuthHeading'
import { AuthTextInput } from './AuthTextInput'

const MIN_PASSWORD_LENGTH = 8

type ResetErrors = {
  confirm?: string
  password?: string
}

export const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ResetErrors>({})
  const resetPassword = useMutation('post', '/api/v1/auth/reset-password', {
    meta: { suppressErrorToast: true },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: ResetErrors = {
      confirm:
        password !== confirmPassword ? "Passwords don't match" : undefined,
      password:
        password.length < MIN_PASSWORD_LENGTH
          ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
          : undefined,
    }
    setErrors(nextErrors)
    if (nextErrors.confirm || nextErrors.password) return

    try {
      await resetPassword.mutateAsync({ body: { password, token } })
      showApiSuccessToast('Password updated. You can now log in.')
      router.replace(ROUTES.auth.login)
    } catch (error) {
      showApiErrorToast(error, 'Unable to reset the password.')
    }
  }

  if (!token) {
    return (
      <>
        <AuthHeading title="Create a new password" />
        <AuthAlert title="Link incomplete" tone="destructive">
          This password reset link is missing its token. Request a new link and
          try again.
        </AuthAlert>
        <Button asChild className="w-full font-medium" variant="outline">
          <Link href={ROUTES.auth.forgotPassword}>Request another link</Link>
        </Button>
      </>
    )
  }

  return (
    <>
      <AuthHeading
        description="Choose a new password for your account."
        title="Create a new password"
      />
      <form
        aria-busy={resetPassword.isPending}
        className="flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit}
      >
        <AuthTextInput
          autoComplete="new-password"
          error={errors.password}
          id="new-password"
          label="New password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          secret
          value={password}
        />
        <AuthTextInput
          autoComplete="new-password"
          error={errors.confirm}
          id="confirm-new-password"
          label="Confirm new password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          secret
          value={confirmPassword}
        />
        <Button
          className="w-full font-medium"
          disabled={resetPassword.isPending}
          type="submit"
          variant="primary"
        >
          {resetPassword.isPending ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </>
  )
}
