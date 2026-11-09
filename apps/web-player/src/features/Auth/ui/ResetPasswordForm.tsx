'use client'

import { Button } from '@bitrate/ui-react'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { AuthAlert } from './AuthAlert'
import { AuthHeading } from './AuthHeading'
import { AuthTextInput } from './AuthTextInput'
import { AUTH_BUTTON_CLASS } from './authStyles'

const MIN_PASSWORD_LENGTH = 8

type ResetErrors = {
  confirm?: TranslationKey
  password?: TranslationKey
}

export const ResetPasswordForm = () => {
  const { t } = useI18n()
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
        password !== confirmPassword
          ? 'validation.password.mismatch'
          : undefined,
      password:
        password.length < MIN_PASSWORD_LENGTH
          ? 'validation.password.min'
          : undefined,
    }
    setErrors(nextErrors)
    if (nextErrors.confirm || nextErrors.password) return

    try {
      await resetPassword.mutateAsync({ body: { password, token } })
      showApiSuccessToast(t('auth.reset.success'))
      router.replace(ROUTES.auth.login)
    } catch (error) {
      showApiErrorToast(error, t('auth.reset.failed'))
    }
  }

  if (!token) {
    return (
      <>
        <AuthHeading title={t('auth.reset.title')} />
        <AuthAlert title={t('auth.reset.incompleteTitle')}>
          {t('auth.reset.incomplete')}
        </AuthAlert>
        <Button asChild className={AUTH_BUTTON_CLASS} variant="outline">
          <Link href={ROUTES.auth.forgotPassword}>
            {t('auth.reset.requestAnother')}
          </Link>
        </Button>
      </>
    )
  }

  return (
    <>
      <AuthHeading
        description={t('auth.reset.description')}
        title={t('auth.reset.title')}
      />
      <form
        aria-busy={resetPassword.isPending}
        className="flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit}
      >
        <AuthTextInput
          autoComplete="new-password"
          error={errors.password && t(errors.password)}
          id="new-password"
          label={t('auth.reset.newPassword')}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          secret
          value={password}
        />
        <AuthTextInput
          autoComplete="new-password"
          error={errors.confirm && t(errors.confirm)}
          id="confirm-new-password"
          label={t('auth.reset.confirmPassword')}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          secret
          value={confirmPassword}
        />
        <Button
          className={AUTH_BUTTON_CLASS}
          disabled={resetPassword.isPending}
          type="submit"
          variant="primary"
        >
          {resetPassword.isPending
            ? t('auth.reset.submitting')
            : t('auth.reset.submit')}
        </Button>
      </form>
    </>
  )
}
